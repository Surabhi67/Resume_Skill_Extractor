import requests
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

def askllm(prompt: str) -> any:
    formatted_prompt = f"""
    You are a backend API. You must only return raw, valid JSON — no explanations, no markdown, no surrounding text. Any additional text will break the application.
    
    Given the resume {prompt} extract the following information as a json:
    (
    "name": "string",
    "phone": "string",
    "email": "string",
    "skills": (
        "technical": ["string", "..."],
        "soft": ["string", "..."]
    ),
    "workExperience": [
        (
        "company": "string",
        "years": "string",
        "role": "string"
        )
    ],
    "projects": [
        (
        "name": "string"
        "technology": "string"
        )
    ]
    )
    """
    print(prompt)
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": "Bearer " + os.getenv("llama_3.3_API_KEY"),
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "meta-llama/llama-3.3-70b-instruct:free",
                "messages": [
                    {
                        "role": "user",
                        "content": formatted_prompt
                    }
                ],
            })
        )
        raw_content = response.json()['choices'][0]['message']['content']
        print("Raw content from LLM:\n", raw_content)
        cleaned_content = re.sub(r"^```(?:json)?|```$", "", raw_content.strip(), flags=re.MULTILINE).strip()

        try:
            return json.loads(cleaned_content)
        except json.JSONDecodeError:
            # Return cleaned text if JSON fails
            return cleaned_content
    except Exception as e:
        print("Error getting LLM response:", e)
        return ""
    