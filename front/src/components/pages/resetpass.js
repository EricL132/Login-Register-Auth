import React from 'react'
import './resetpass.css'

class resetpass extends React.Component {
    constructor(props) {
        super(props)

        this.checkIfAuthorized()

        this.state = { authorized: false,errorMessage:'',resetComplete:false }
        this.doReset = this.doReset.bind(this)
        this.backtoHome = this.backtoHome.bind(this)

    }

    async checkIfAuthorized() {
        const res = await fetch(`/user/checkresettoken/${this.props.location.search}`)
        if (res.status === 200) {
            this.setState({ authorized: true })
        } else {
            this.props.history.push('/permissiondenied')
        }
    }
    async doReset(){
        const pass = document.getElementById('password').value

        const confirmPass = document.getElementById('password-confirm').value
        if(!pass){
            this.setState({errorMessage:'Invalid Password'}) 
            return 
        }
        if(pass!==confirmPass){
            this.setState({errorMessage:'Passwords do not match'}) 
            return 
        }
        const res = await fetch('/user/resetpass',{method:'POST',headers: { 'Content-Type': 'application/json' },body:JSON.stringify({token:this.props.location.search.split('=')[1],password:pass})})
        if(res.status===200){
            this.setState({resetComplete:true})
        }
    }
    backtoHome(){
        this.props.history.push('/')
    }
    render() {
        if (this.state.authorized) {
            return (
                <>
                {!this.state.resetComplete?
                <div className="resetpass-container">
                    <div className="resetpass-inner">
                        <div className="inf-con" style={{marginTop:'4rem'}}>
                            <input type='password' autoComplete="new-password" id='password' placeholder="New password" className="input-info"></input>
                            <span id="password-error" className="error-span"></span>
                        </div>
                        <div className="inf-con">
                            <input type='password' autoComplete="new-confirm" id='password-confirm' placeholder="Confirm new password" className="input-info"></input>
                            <span id="password-confirm-error" className="error-span"></span>
                        </div>
                        <div id="error-message">{this.state.errorMessage}</div>
                        <button onClick={this.doReset} className="submitButton">Reset Password</button>
                    </div>
                </div>
                :
                <div className="resetpass-container">
                <div className="resetpass-inner">
                    <h1>Password Changed</h1>
                    <button onClick={this.backtoHome} className="Changed-Button">Back to login</button>
                </div>
            </div>}
</>
            )
        }
        return <div id="loadingScreen"></div>
    }
}


export default resetpass