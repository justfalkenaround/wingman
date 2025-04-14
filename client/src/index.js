/*_____ IMPORT ALL DEPENDENCIES _____*/
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/pages/App/App.js'
import ErrorBoundary from './components/other/ErrorBoundary/ErrorBoundary.js'
import { BrowserRouter as Router } from 'react-router-dom'

/*_____ RENDER THE APP IN A ROUTER AND ERROR BOUNDARY _____*/
ReactDOM.createRoot(document.getElementById('root')).render(
    (
        <ErrorBoundary>
            <Router>
                <App />
            </Router>
        </ErrorBoundary>
    )
)