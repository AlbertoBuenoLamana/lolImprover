import pyttsx3
import time
import argparse

def reproducir_recordatorio(intervalo_segundos):
    """
    Reproduce un mensaje de voz que dice "¿qué es lo siguiente?" cada X segundos.
    
    Args:
        intervalo_segundos (int): Intervalo en segundos entre cada reproducción.
    """
    # Inicializar el motor de texto a voz
    motor = pyttsx3.init()
    
    # Configurar la voz en español si está disponible
    voces = motor.getProperty('voices')
    for voz in voces:
        if 'spanish' in voz.languages or 'es' in voz.id.lower():
            motor.setProperty('voice', voz.id)
            break
    
    # Establecer una velocidad de habla razonable
    motor.setProperty('rate', 150)
    
    print(f"Recordatorio configurado cada {intervalo_segundos} segundos.")
    print("Presiona Ctrl+C para detener el programa.")
    
    try:
        while True:
            # Reproducir el mensaje
            print("\nReproduciendo recordatorio...")
            motor.say("¿Qué es lo siguiente?")
            motor.runAndWait()
            
            # Esperar el intervalo definido
            print(f"Esperando {intervalo_segundos} segundos hasta el próximo recordatorio.")
            time.sleep(intervalo_segundos)
    
    except KeyboardInterrupt:
        print("\nPrograma detenido por el usuario.")

if __name__ == "__main__":
    # Configurar el parser de argumentos
    parser = argparse.ArgumentParser(description='Reproduce un recordatorio de voz a intervalos regulares.')
    parser.add_argument('-s', '--segundos', type=int, default=60,
                        help='Intervalo en segundos entre cada recordatorio (predeterminado: 60)')
    
    args = parser.parse_args()
    
    # Iniciar el programa
    reproducir_recordatorio(args.segundos)