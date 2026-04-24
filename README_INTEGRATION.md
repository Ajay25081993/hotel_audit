# 🏨 Hotel Audit Management System - Full Stack Integration

A complete hotel audit management system with React frontend, Python backend, and Google Gemini AI integration.

## 🚀 System Architecture

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript and Vite
- **UI Components**: Modern, responsive interface for hotel audit management
- **Port**: http://localhost:5173

### Backend (Python + FastAPI)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL
- **AI Integration**: Google Gemini AI for smart audit features
- **Port**: http://localhost:8000

### AI Features (Google Gemini)
- **Photo Analysis**: AI-powered compliance checking from audit photos
- **Report Generation**: Automated audit report creation with insights
- **Score Suggestions**: Intelligent scoring recommendations
- **API Key**: AIzaSyBiw_Q_EuU6PWVJdK_dRc8HHbDxq5ORxxw

## 📋 Features

### User Management & Authentication
- Role-based access control (Admin, Auditor, Reviewer, Corporate, Hotel GM)
- JWT-based authentication
- Secure password hashing with bcrypt

### Audit Management
- Create and manage hotel audits
- Track audit status and progress
- Assign auditors and reviewers
- Property-specific audit workflows

### AI-Powered Features
- **Smart Photo Analysis**: Upload photos and get AI compliance assessments
- **Automated Reporting**: Generate comprehensive audit reports with AI insights
- **Intelligent Scoring**: Get score suggestions based on observations
- **Compliance Zone Detection**: Automatic green/amber/red zone classification

### Data Management
- Property management
- Audit item tracking
- Compliance scoring
- Historical data and analytics

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.8+)
- PostgreSQL
- Git

### Quick Start
```bash
# 1. All dependencies are already installed!
# 2. Database is already set up and seeded!
# 3. Start the full system:
./start_full_system.sh
```

### Manual Setup (if needed)
```bash
# Install Python dependencies
source venv/bin/activate
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Start PostgreSQL
sudo service postgresql start

# Initialize database
cd python_backend && python init_db.py

# Start backend
cd python_backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start frontend (in another terminal)
npm run dev
```

## 🔐 Test Credentials

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | admin | admin123 | Full system access |
| Auditor | sarah.johnson | auditor123 | Conduct audits |
| Reviewer | lisa.thompson | reviewer123 | Review completed audits |
| Corporate | raj.patel | corporate123 | Corporate oversight |
| Hotel GM | priya.sharma | hotelgm123 | Hotel management |

## 🌐 Access Points

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Integration Test Page**: file://test_integration.html

## 🤖 AI Integration Details

### Gemini AI Configuration
```python
# Environment variables
GEMINI_API_KEY=AIzaSyBiw_Q_EuU6PWVJdK_dRc8HHbDxq5ORxxw
```

### AI Endpoints
- `POST /api/ai/analyze-photo` - Analyze audit photos for compliance
- `POST /api/ai/generate-report` - Generate comprehensive audit reports
- `POST /api/ai/suggest-score` - Get AI-powered scoring suggestions

### AI Features Usage
```javascript
// Photo Analysis
const result = await apiClient.analyzePhoto(imageBase64, context);

// Report Generation
const report = await apiClient.generateReport(auditId);

// Score Suggestion
const score = await apiClient.suggestScore(auditItemId, observations);
```

## 📊 Database Schema

### Key Tables
- **users**: User management and authentication
- **properties**: Hotel properties being audited
- **audits**: Audit instances and metadata
- **audit_items**: Individual audit items and scores

### Sample Data
- 5 test users with different roles
- 3 sample properties (hotels)
- 1 sample audit with items

## 🔧 Development

### Project Structure
```
/workspace
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # API client and utilities
├── python_backend/        # Python FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
└── README_INTEGRATION.md # This file
```

### Key Technologies
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Pydantic
- **AI**: Google Gemini AI (gemini-pro, gemini-pro-vision)
- **Auth**: JWT tokens, bcrypt password hashing
- **Database**: PostgreSQL with Alembic migrations

## 🧪 Testing

### Integration Test
Open `test_integration.html` in your browser to run comprehensive integration tests:
- Backend health check
- Frontend connectivity
- Authentication flow
- API endpoints
- AI features
- Database connectivity

### API Testing
Visit http://localhost:8000/docs for interactive API documentation with Swagger UI.

### Manual Testing
1. Login with test credentials
2. Navigate through different user dashboards
3. Create/view audits and properties
4. Test AI features with sample data

## 🚨 Troubleshooting

### Common Issues

**PostgreSQL Connection Error**
```bash
sudo service postgresql start
```

**Port Already in Use**
```bash
# Kill processes using ports 8000 or 5173
pkill -f "uvicorn"
pkill -f "vite"
```

**Missing Dependencies**
```bash
# Reinstall Python dependencies
pip install -r requirements.txt

# Reinstall Node dependencies
npm install
```

**Gemini AI Not Responding**
- Check API key configuration
- Verify internet connectivity
- Review AI service logs

## 📈 Production Deployment

### Environment Variables
```bash
# Production settings
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-production-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### Security Checklist
- [ ] Change default passwords
- [ ] Update secret keys
- [ ] Configure HTTPS
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring

## 🎯 Next Steps

### Potential Enhancements
1. **Real-time Notifications**: WebSocket integration
2. **File Upload**: Direct photo upload to cloud storage
3. **Advanced Analytics**: Charts and dashboards
4. **Mobile App**: React Native mobile version
5. **Offline Support**: PWA with offline capabilities
6. **Multi-tenant**: Support for multiple hotel chains

### AI Improvements
1. **Custom Training**: Train models on hotel-specific data
2. **Voice Commands**: Voice-to-text audit notes
3. **Predictive Analytics**: Predict maintenance needs
4. **Automated Scheduling**: AI-powered audit scheduling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For support and questions:
- Check the integration test page
- Review API documentation
- Check server logs
- Test individual components

---

**🎉 Congratulations! Your full-stack hotel audit management system with AI integration is now running!**
