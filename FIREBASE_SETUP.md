# Пошаговая инструкция по настройке Firebase Authentication

## Шаг 1: Создание проекта в Firebase

1. Перейдите на сайт [Firebase Console](https://console.firebase.google.com/)
2. Нажмите кнопку **"Добавить проект"** (Add project)
3. Введите название проекта (например: "Marketio" или "Signature Marketing")
4. Нажмите **"Продолжить"** (Continue)
5. (Опционально) Отключите Google Analytics, если не нужен, или оставьте включенным
6. Нажмите **"Создать проект"** (Create project)
7. Дождитесь создания проекта (30-60 секунд)
8. Нажмите **"Продолжить"** (Continue)

## Шаг 2: Добавление веб-приложения

1. В главном меню проекта нажмите на иконку **Web** (`</>`) или найдите "Добавить приложение" → "Web"
2. Введите название приложения (например: "Marketio Web")
3. (Опционально) Отметьте "Также настройте Firebase Hosting"
4. Нажмите **"Зарегистрировать приложение"** (Register app)
5. **ВАЖНО!** Скопируйте конфигурационный код Firebase, который выглядит так:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

6. Сохраните этот код - он понадобится позже!
7. Нажмите **"Далее"** (Next) и затем **"Продолжить в консоли"** (Continue to console)

## Шаг 3: Включение Authentication

1. В левом меню Firebase Console найдите и нажмите **"Authentication"** (Аутентификация)
2. Нажмите **"Начать"** (Get started)
3. Перейдите на вкладку **"Sign-in method"** (Методы входа)
4. Найдите **"Email/Password"** в списке провайдеров
5. Нажмите на **"Email/Password"**
6. Включите переключатель **"Включить"** (Enable)
7. Нажмите **"Сохранить"** (Save)

## Шаг 4: Получение необходимой информации

После выполнения всех шагов, вам нужно отправить мне следующую информацию:

### 1. Firebase Config (конфигурация)
Скопируйте весь объект `firebaseConfig` из шага 2. Он должен содержать:
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

### 2. Проверка
Убедитесь, что:
- ✅ Проект создан
- ✅ Веб-приложение добавлено
- ✅ Authentication включен
- ✅ Email/Password метод активирован

## Формат отправки данных

Отправьте мне данные в таком формате:

```
apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
authDomain: "your-project.firebaseapp.com"
projectId: "your-project-id"
storageBucket: "your-project.appspot.com"
messagingSenderId: "123456789012"
appId: "1:123456789012:web:abcdef1234567890"
```

Или просто скопируйте весь объект firebaseConfig.

---

## Дополнительные настройки (опционально)

### Настройка домена для авторизации:
1. В Authentication → Settings → Authorized domains
2. Убедитесь, что ваш домен добавлен (localhost уже есть по умолчанию)

### Настройка шаблонов email (опционально):
1. Authentication → Templates
2. Можно настроить внешний вид писем для подтверждения email и сброса пароля

---

**После того, как вы получите все данные, отправьте их мне, и я обновлю код для работы с Firebase!**

