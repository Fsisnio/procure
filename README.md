# ProcureX

A modern, comprehensive supplier management web application built with React, TypeScript, and Material-UI.

## Features

### 🏠 Dashboard
- Real-time statistics and key metrics
- Top suppliers overview
- Recent orders tracking
- Stock levels monitoring
- Visual progress indicators

### 👥 Supplier Management
- Complete supplier database
- Advanced search and filtering
- Supplier rating system
- Contact information management
- Status tracking (Active, Pending, Inactive)
- Detailed supplier profiles

### 📦 Product Management
- Product catalog with supplier associations
- Stock level monitoring
- Price tracking
- Category organization
- Low stock alerts

### 🛒 Order Management
- Purchase order creation and tracking
- Order status management
- Delivery date tracking
- Order history and analytics

### 📊 Reports & Analytics
- Comprehensive reporting system
- Supplier performance metrics
- Spending analysis
- Order trends and patterns

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Data Grid**: MUI X Data Grid
- **State Management**: React Hooks
- **Styling**: Emotion (CSS-in-JS)
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd procurex
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   └── Dashboard.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── Suppliers/
│       └── SuppliersList.tsx
├── data/
│   └── mockData.ts
├── types/
│   └── index.ts
├── App.tsx
└── index.tsx
```

## Key Components

### Dashboard
The main dashboard provides an overview of the entire supplier management system with:
- Statistics cards showing key metrics
- Top suppliers list with ratings
- Recent orders overview
- Stock level indicators

### Suppliers List
A comprehensive supplier management interface featuring:
- Data grid with sorting and filtering
- Search functionality
- Status-based filtering
- Action menus for each supplier
- Detailed supplier information dialogs

### Layout Components
- **Sidebar**: Navigation menu with all major sections
- **Header**: User profile, notifications, and search functionality

## Data Models

The application uses TypeScript interfaces for type safety:

- **Supplier**: Complete supplier information including contact details, ratings, and status
- **Product**: Product catalog with supplier associations and stock levels
- **Order**: Purchase orders with items and status tracking
- **DashboardStats**: Aggregated statistics for the dashboard

## Mock Data

The application includes comprehensive mock data to demonstrate functionality:
- 4 sample suppliers with different statuses and ratings
- 4 products across different categories
- 2 sample orders with various statuses
- Dashboard statistics

## Customization

### Styling
The application uses Material-UI's theming system. You can customize the theme in `src/index.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize primary color
    },
    // Add more customizations
  },
});
```

### Adding New Features
1. Create new components in the appropriate directory
2. Add routes in `src/App.tsx`
3. Update the sidebar navigation in `src/components/Layout/Sidebar.tsx`
4. Add corresponding TypeScript interfaces in `src/types/index.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

---

**ProcureX** - Streamlining supplier relationships for better business outcomes. 