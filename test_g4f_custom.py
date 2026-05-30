import g4f
from g4f.client import Client

client = Client()
try:
    response = client.chat.completions.create(
        model=g4f.models.default,
        messages=[{"role": "user", "content": "Hello!"}],
        provider=g4f.Provider.PollinationsAI
    )
    print("Success:", response.choices[0].message.content)
except Exception as e:
    print("Error:", str(e))
