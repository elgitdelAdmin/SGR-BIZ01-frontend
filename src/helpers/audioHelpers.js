export const playNotificationSound = (count = 1) => {
    try {
        if ('speechSynthesis' in window) {
            // Cancelar si ya estaba hablando para que no se pongan en cola
            window.speechSynthesis.cancel();
            
            const texto = count === 1 
                ? "Usted tiene una nueva notificación" 
                : `Usted tiene ${count} nuevas notificaciones`;

            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-ES'; // Idioma español
            utterance.rate = 1.0;     // Velocidad normal
            utterance.pitch = 1.0;    // Tono normal
            
            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.error("Error con la síntesis de voz:", e);
    }
};

let loopingInterval = null;

export const startLoopingNotificationSound = (count = 1) => {
    if (loopingInterval) return;
    playNotificationSound(count);
};

export const stopLoopingNotificationSound = () => {
    if (loopingInterval) {
        clearInterval(loopingInterval);
        loopingInterval = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};
