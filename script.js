// Text to Text Translator
document.getElementById('inputText').addEventListener('input', translateText);
document.getElementById('languageSelector').addEventListener('change', translateText);

async function translateText() { //funtion call karnein ke liye
    const inputText = document.getElementById('inputText').value;
    const targetLanguage = document.getElementById('languageSelector').value;
    
    if (inputText.trim() === '') {
        document.getElementById('outputText').value = '';
        return;
    }

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=en|${targetLanguage}`);
        const data = await response.json();
        document.getElementById('outputText').value = data.responseData.translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        document.getElementById('outputText').value = 'Translation error';
    }
}

// Voice to Voice Translator
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US'; // Default language
    recognition.continuous = true;
    recognition.interimResults = false;

    document.getElementById('startVoice').addEventListener('click', () => {
        recognition.start();
    });

    document.getElementById('stopVoice').addEventListener('click', () => {
        recognition.stop();
    });

    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const targetLanguage = document.getElementById('voiceLanguageSelector').value;

        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(transcript)}&langpair=en|${targetLanguage}`);
            const data = await response.json();
            document.getElementById('voiceOutput').innerText = data.responseData.translatedText;
        } catch (error) {
            console.error('Error translating voice input:', error);
            document.getElementById('voiceOutput').innerText = 'Translation error';
        }
    };
} else {
    alert('Speech Recognition API not supported in this browser.');
}

// Image Translator
document.getElementById('translateImage').addEventListener('click', async () => {
    const file = document.getElementById('imageInput').files[0];
    if (!file) {
        alert('Please upload an image first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function () {
        const img = new Image();
        img.src = reader.result;

        img.onload = async function () {
            const { TesseractWorker } = Tesseract;
            const worker = new TesseractWorker();
            worker.recognize(img)
                .progress((p) => {
                    console.log('progress', p);
                })
                .then(async ({ text }) => {
                    const targetLanguage = document.getElementById('languageSelector').value;
                    try {
                        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`);
                        const data = await response.json();
                        document.getElementById('imageOutputText').value = data.responseData.translatedText;
                    } catch (error) {
                        console.error('Error translating image text:', error);
                        document.getElementById('imageOutputText').value = 'Translation error';
                    }
                })
                .finally(() => {
                    worker.terminate();
                });
        };
    };
    reader.readAsDataURL(file);
});
