# hire-guide 🚀


**hire-guide** is a full-stack web application that connects tourists with local guides and offers hotel/tour booking services. Built with modern technologies, it provides a seamless experience for travelers to discover destinations, find verified guides, and book accommodations.

## ✨ Features

### 🏨 **Hotel Management**
- Complete hotel CRUD operations
- Property type selection (Hotel, Resort, Guest House, Apartment)
- Amenities management with checkbox selection
- Room availability tracking
- Price per night configuration
- Admin dashboard for hotel management

### 🧭 **Guide Marketplace**
- Guide profile creation and editing
- Multi-select specialties (Trekking, Cultural Tours, Wildlife, etc.)
- Multi-language support selection
- Certifications management (add/remove)
- Hourly & daily rate configuration
- Experience years tracking

### 🔍 **Smart Search & Discovery**
- Location-based filtering (City, PIN Code)
- Price range filtering
- Rating-based filtering
- Real-time search results
- Filter persistence across page reloads

### 📱 **Responsive Design**
- Mobile-first responsive UI
- Dark mode support
- Modern Tailwind CSS styling
- Consistent design system across all pages

### 🛡️ **Authentication & Security**
- JWT-based authentication
- Role-based access control (Admin, Hotel Owner, Guide, Tourist)
- Secure API endpoints
- Protected routes and dashboards

### 📊 **Admin Dashboards**
- Hotel owner dashboard
- Guide dashboard
- Booking management
- Profile editing interfaces

---

## 🛠️ Tech Stack

### Frontend

Next.js 14 (App Router) - React 18
Tailwind CSS - TypeScript
Lucide React Icons - Zustand (State)
React Hook Form - Axios

### Backend

Node.js 20 - Express.js
PostgreSQL - Prisma ORM
JWT Authentication - bcryptjs

### Deployment

Frontend: Vercel - Backend: Railway/Render
Database: PostgreSQL - Vercel Analytics

### Development

Git/GitHub - ESLint + Prettier
Vite (Dev) - Husky + Lint-staged


---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### 1. Clone & Install

```bash
git clone https://github.com/amitsingh7322/hire-guide.git
cd tourspot-connect
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 4. Environment Variables

**Backend `.env`:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 📁 Project Structure
hire-guide/
├── frontend/ # Next.js App Router
│ ├── app/
│ │ ├── guides/ # Guide listing & profiles
│ │ ├── hotels/ # Hotel listing & management
│ │ └── dashboard/ # Role-based dashboards
│ ├── components/ # Reusable UI components
│ └── lib/ # API client, utils
├── backend/ # Node.js + Express
│ ├── src/
│ │ ├── controllers/ # API logic
│ │ ├── routes/ # API routes
│ │ └── prisma/ # Database schema
└── docs/ # Documentation


---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/guides` | List guides with filters |
| `GET` | `/api/guides/profile` | Get current guide profile |
| `PUT` | `/api/guides/profile` | Update guide profile |
| `GET` | `/api/hotels` | List hotels |
| `GET` | `/api/hotels/profile/me` | Get current hotel profile |
| `PUT` | `/api/hotels/:id/profile` | Update hotel profile |

**Full API Docs:** [OpenAPI/Swagger](docs/api.md)

---

## 🎨 Design System

- **Primary Color:** Teal (`#14b8a6`)
- **Buttons:** `btn-primary`, `btn-secondary`
- **Forms:** `label`, `input` classes
- **Cards:** `card` with shadow
- **Icons:** Lucide React

---

## 🧪 Testing

```bash
# Frontend
npm run test
npm run test:ui

# Backend
npm run test
npm run test:watch
```

---

## 🚀 Deployment

### Vercel (Frontend)
1. Connect GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically on push

### Railway/Render (Backend)
1. Connect PostgreSQL database
2. Set environment variables
3. Deploy from GitHub

---

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Development Workflow:**

Feature Branch → Staging → Main → Production


---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgments

- **Next.js Team** - Amazing framework
- **Tailwind CSS** - Beautiful utilities
- **Lucide Icons** - Perfect icons
- **Vercel** - Lightning-fast deployments
- **Prisma** - Amazing ORM experience

---

## 📞 Support

**Live Demo:** [hire-guide.vercel.app/](https://hire-guide.vercel.app/)
**API Docs:** [hire-guide.onrender.com](https://hire-guide.onrender.com)

**Issues:** [GitHub Issues](https://github.com/amitsingh7322/hire-guide/issues)

---
<img width="1901" height="879" alt="image" src="https://github.com/user-attachments/assets/201025b6-b710-44cc-bdbc-caac24fc20bf" />
<img width="1893" height="830" alt="image" src="https://github.com/user-attachments/assets/f7dfa670-d361-4ec4-8de0-8fa907953872" />
<img width="1880" height="834" alt="image" src="https://github.com/user-attachments/assets/c046421f-5b24-457d-9aa5-51e007ef52e7" />



<div align="center">
  Made with ❤️ for travelers worldwide<br>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
</div>
