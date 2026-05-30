import g4f
from g4f.client import Client

client = Client()
try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hello!"}],
    )
    print("Success:", response.choices[0].message.content)
except Exception as e:
    print("Error:", str(e))
