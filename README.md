# 📚 Book Management API

A RESTful NestJS API that allows users to manage books, follow other users, and comment on books. The API supports JWT authentication, Redis caching, MongoDB database, and comes with full CI/CD integration using  GitHub Actions, Docker

---

## 🚀 Features

* User authentication with JWT
* Book CRUD operations
* Comment system for books
* User follow/unfollow functionality
* Pagination for books and comments
* Redis caching for optimized performance
* Multi-environment setup (`.dev.env`, `.staging.env`, `.prod.env`)
* Swagger API documentation
* CI/CD (tHub Actions)
* Dockerized & deployable on AWS EC2
* Security scanning (Trivy) and code quality (SonarQube)

---

## 🧩 Tech Stack

* **Backend Framework**: NestJS
* **Database**: MongoDB (Mongoose)
* **Cache**: Redis
* **Auth**: JWT
* **DevOps**: Docker, GitHub Actions, Kubernetes, Trivy, SonarQube
* **Docs**: Swagger

---

## 📁 Project Structure

```
src/
├── common/
├── constants/
├── helpers/
├── interfaces/
├── modules/
├── utils/
├── app.module.ts
├── main.ts
.env/.dev.env/.staging.env/.prod.env
```

---

## ⚙️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/EmmanuelOmoiya/trustpadi-test.git
cd trustpadi-test
```


### Setting Up the Environment

### Prerequisites:

- #### Ensure you have NodeJs and Npm installed.
- You can download and install Node.js from [nodejs.org](https://nodejs.org/).
- Check your installation here:
```bash
node -v
npm -v
```
- #### Ensure you have NestJs installed

- Install the NestJS CLI globally using npm:

```
npm install -g @nestjs/cli
```
- Check your installation

```
nest -v
```
- #### Ensure you have pnpm installed
- Install the pnpm globally using npm:

```
npm install -g pnpm@latest
```

- Check your installation

```
pnpm -v
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create your environment files:

* `.dev.env`
* `.staging.env`
* `.prod.env`

Example `.dev.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/book-api
JWT_ACCESS_TOKEN_SECRET="XXX"
JWT_ACCESS_TOKEN_EXPIRATION_TIME="20m"
JWT_REFRESH_TOKEN_SECRET="XX"
JWT_REFRESH_TOKEN_EXPIRATION_TIME="100m"
SALT_ROUNDS=10
JWT_EXPIRES_IN=1d
ENCRYPTION_KEY='XSXXX'
REDIS_HOST="redis-XXXXX"
REDIS_PORT="XXXX"
NODE_ENV=development
```

### 4. Run the App

```bash
npm run start:dev
```

---

## 🧪 Running Tests

```bash
npm run test
```

---

## 🔐 Authentication

The API uses **JWT** for securing endpoints. Include the `Authorization: Bearer <token>` header in requests to protected routes.

---

## 📘 API Documentation

Swagger is available at:

```
http://localhost:3000/docs
```

---

## 📦 Docker Support

### Build Image

```bash
docker build -t book-api .
```

### Run Container

```bash
docker run -p 4000:4000 --env-file .dev.env book-api
```

---

## 🧰 CI/CD Setup

* **GitHub Actions** handles testing and Docker image builds on each push.
* **Jenkins** pipelines can be configured to:

  * Pull code
  * Run tests
  * Scan with Trivy
  * Analyze with SonarQube
  * Deploy to EC2/Kubernetes

---

## ☁️ Deployment

### Using AWS EC2 (or any cloud)

1. Provision your instance
2. Install Docker, Node.js, MongoDB, Redis
3. Pull and run the image:

```bash
docker run -d -p 80:4000 --env-file .prod.env book-api
```

### Kubernetes

Deployment YAMLs (optional) should be placed in a `k8s/` directory:

```bash
kubectl apply -f k8s/deployment.yaml
```

---

## 📊 Quality & Security

* **Trivy** scans for container vulnerabilities
* **SonarQube** performs static code analysis
* Run them in CI or manually with Docker

---

## ✅ Endpoints Summary

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| GET    | /books                | Get all books          |
| GET    | /books/\:id           | Get book by ID         |
| POST   | /books                | Create book (auth)     |
| PUT    | /books/\:id           | Update book (auth)     |
| DELETE | /books/\:id           | Delete book (auth)     |
| POST   | /books/\:id/comments  | Comment on book (auth) |
| GET    | /books/\:id/comments  | Get book comments      |
| POST   | /users/\:id/follow    | Follow user (auth)     |
| DELETE | /users/\:id/follow    | Unfollow user (auth)   |
| GET    | /users/\:id/followers | Get followers          |
| GET    | /users/\:id/following | Get following          |

---

## 🧑‍💻 Author

**Emmanuel Omoiya**
[GitHub](https://github.com/EmmanuelOmoiya) | [LinkedIn](https://linkedin.com/in/emmanuelomoiya)

---

## 📝 License

MIT License
