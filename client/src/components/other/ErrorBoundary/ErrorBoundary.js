/*_____ IMPORT ALL DEPENDENCIES _____*/
import { Component } from 'react'
import ErrorComponent from '../ErrorComponent/ErrorComponent.js'

/*_____ BASIC ERROR WRAPPER BASED ON DEVDOCS EXAMPLE _____*/
class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    /*_____ WILL RENDER A FALLBACK COMPONENT _____*/
    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (<ErrorComponent error={this.error} />)
            )
        }
        return this.props.children
    }
}

/*_____ EXPORT COMPONENT _____*/
export default ErrorBoundary