import React from 'react'
import './nopermission.css'

class noper extends React.Component{
    constructor(props){
        super(props)
        this.backtoHome = this.backtoHome.bind(this)
    }

    backtoHome(){
        this.props.history.push('/')
    }
    render(){
        return(
            <div className="accessdenied-container">
                <div className="accessdenied">
                    <h1>Page Not Found</h1>
                    <button onClick={this.backtoHome}>Back to login</button>
                </div>
            </div>
        )
    }
}


export default noper