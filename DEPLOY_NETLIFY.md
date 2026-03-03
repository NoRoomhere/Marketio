# Публікація Marketio на Netlify

## 1. Завантаж код на GitHub

Якщо репозиторій ще не створений:

```bash
cd "c:\Users\User\Desktop\Personal projects\Marketio"
git init
git add .
git commit -m "Marketio MVP"
```

Створи репозиторій на [github.com](https://github.com/new) (наприклад `marketio`), потім:

```bash
git remote add origin https://github.com/ТВІЙ_ЛОГІН/marketio.git
git branch -M main
git push -u origin main
```

## 2. Підключи сайт у Netlify

1. Зайди на [app.netlify.com](https://app.netlify.com) і увійди (або зареєструйся).
2. Натисни **Add new site** → **Import an existing project**.
3. Обери **GitHub** і дозволь доступ. Вибери репозиторій **marketio**.
4. Переконайся, що:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (або залиш автоматичне визначення для Next.js)
   - **Base directory:** порожньо
5. Натисни **Add environment variables** і додай усі змінні з твого `.env.local`:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | з Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ... |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ... |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ... |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ... |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ... |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (опційно) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | з Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | з Cloudinary |

6. Натисни **Deploy site**.

## 3. Після деплою

- Netlify видасть URL типу `https://random-name-123.netlify.app`.
- У **Firebase Console** → Authentication → Settings → Authorized domains — додай цей домен (наприклад `random-name-123.netlify.app`).
- У **Cloudinary** переконайся, що Upload preset дозволяє завантаження з будь-якого домену (або додай домен Netlify).

## 4. Свій домен (опційно)

У Netlify: **Site settings** → **Domain management** → **Add custom domain** — вкажи свій домен (наприклад `marketio.ua`) і виконай інструкції для DNS.

---

Файл `.env.local` не потрапляє в репозиторій (він у `.gitignore`), тому змінні **обовʼязково** потрібно ввести в Netlify вручну.
