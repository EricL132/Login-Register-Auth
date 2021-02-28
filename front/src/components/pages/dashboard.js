import fetch from 'node-fetch'
import React from 'react'
import './dashboard.css'
class dashboard extends React.Component{
    constructor(props){
        super(props)
        this.state = {authToken:"",haveInfo:false}
        this.searchUserInfo = this.searchUserInfo.bind(this)
        this.jwtDecode = this.jwtDecode.bind(this)
        this.doLogout = this.doLogout.bind(this)
        this.searchUserInfo()
       
    }
    async searchUserInfo(){
        const res = await fetch('/auth/checkaccess',{method: 'GET',headers:{'Access-Control-Expose-Headers': 'token','auth-token': this.state.authToken}})
        if(res.status===200){
        const info = await res.json()
        this.setState({authToken:info.token})
        const decodedEmail = await this.jwtDecode()
        this.setState({email:decodedEmail})
        const userres = await fetch(`/user/info/?email=${this.state.email}`)
        const userinfo = await userres.json()
        this.setState({name:userinfo.name})
        this.setState({verifystatus:(userinfo.verifystatus).toString().charAt(0).toUpperCase()+(userinfo.verifystatus).toString().slice(1)})
        this.setState({haveInfo:true})
        }else{
            this.props.history.push('/')
        }

    }
    async doLogout(){
        const res = await fetch('/user/logout',{method:"POsT",body:{}})
        if(res.status===200){
            this.props.history.push('/')
        }
    }
    jwtDecode() {
        let token = {};
        token.payload = JSON.parse(window.atob(this.state.authToken.split('.')[1]));
        return token.payload.email
      }
    render(){
        return(
            <>
            {this.state.haveInfo ?
            <div className="dashboard-container">
                <div className="dashboard">
                    <h1>Hi {this.state.name}</h1>
                    <h2>Email Verified: {this.state.verifystatus}</h2>
                    <button onClick={this.doLogout}>Logout</button>
                </div>
            </div>:null}
            </>
        )
    }
}


export default dashboard