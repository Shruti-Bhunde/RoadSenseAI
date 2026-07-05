import google.genai as genai
print('OK')
print('configure' in dir(genai))
print('GenerativeModel' in dir(genai))
print('Client' in dir(genai))
print('TextGenerationModel' in dir(genai))
print('ImageGenerationModel' in dir(genai))
print([name for name in dir(genai) if name.lower().startswith('generate') or name.lower().startswith('upload') or name.lower().startswith('delete') or name.lower().startswith('client') or name.lower().startswith('model')][:50])
