import React from 'react'
import './home.css'
let authInterval
class home extends React.Component {
  constructor(props) {
    super(props)
    this.state = { displayLogin: true, errormessage: '', loggedin: false, authToken: '', email: '', resetSent: false }
    this.switchActive = this.switchActive.bind(this)
    this.dosignin = this.dosignin.bind(this)
    this.dosignup = this.dosignup.bind(this)
    this.checkAuth = this.checkAuth.bind(this)
    this.checkForlogin = this.checkForlogin.bind(this)
    this.jwtDecode = this.jwtDecode.bind(this)
    this.doForgotPass = this.doForgotPass.bind(this)
    this.openPassModel = this.openPassModel.bind(this)
    this.handleSubmitForgotpass = this.handleSubmitForgotpass.bind(this)
    this.checkForlogin()
  }
  async checkForlogin() {
    const res = await fetch('/auth/checkaccess', { method: 'GET', headers: { 'Access-Control-Expose-Headers': 'token', 'auth-token': this.state.authToken } })



    if (res.status === 200) {
      const info = await res.json()
      this.setState({ authToken: info.token })
      const decodedjwt = await this.jwtDecode()
      this.setState({ email: decodedjwt.email })
      this.setState({ loggedin: true })
      this.props.history.push('/dashboard', { email: this.state.email })
    }
  }
  async jwtDecode() {
    let token = {};
    token.payload = JSON.parse(window.atob(this.state.authToken.split('.')[1]));
    return (token.payload)
  }
  componentDidMount() {
    authInterval = setInterval(() => {
      this.checkAuth();
    }, 5000)
  }
  componentWillUnmount() {
    clearInterval(authInterval)
  }
  async checkAuth() {
    if (this.state.loggedin === true) {
      const res = await fetch('/auth/checkaccess', { method: 'GET', headers: { 'Access-Control-Expose-Headers': 'token', 'auth-token': this.state.authToken } })
      const info = await res.json();
      this.setState({ authToken: info.token })
      if (res.status1 === 405) {
        this.history.push('/logout')
      }

    }
  }
  switchActive() {

    if (this.state.displayLogin) {
      document.getElementsByClassName('login-info')[0].reset();
      document.getElementsByClassName('error-message')[0].innerHTML = ''

      this.setState({ displayLogin: false })
    } else {
      document.getElementsByClassName('login-info')[0].reset();
      document.getElementsByClassName('error-message')[0].innerHTML = ''
      this.setState({ displayLogin: true })
    }
  }
  async dosignin(e) {
    this.setState({ errormessage: '' })
    e.preventDefault()
    const email = e.target[0].value
    const pass = e.target[1].value
    const rem = document.getElementById('remember').checked
    const res = await fetch('user/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass, rem: rem })
      })
    if (res.status === 200) {
      const info = await res.json()
      this.setState({ authToken: info.token })
      this.setState({ loggedin: true })
      this.setState({ email: email })
      this.props.history.push('/dashboard')
    } else {
      const info = await res.json()
      console.log(info)
      this.setState({ errormessage: info.status })

    }
  }



  async dosignup(e) {
    e.preventDefault()
    document.getElementById('name-error').innerHTML = ''
    document.getElementById('email-error').innerHTML = ''
    document.getElementById('password-error').innerHTML = ''
    document.getElementById('password-confirm-error').innerHTML = ''

    const name = e.target[0].value
    const email = e.target[1].value
    const pass1 = e.target[2].value
    const pass2 = e.target[3].value
    if (name.length < 3) {
      document.getElementById('name-error').innerHTML = 'Name must be at least 3 characters'
    }
    if (email.length === 0) {
      document.getElementById('email-error').innerHTML = 'Invalid email'
    }
    if (pass1.length <= 5) {
      document.getElementById('password-error').innerHTML = 'Password must be at least 6 characters'
    }
    if (pass1 !== pass2 || pass2 !== pass1 || pass2.length <= 5) {
      document.getElementById('password-confirm-error').innerHTML = 'Passwords do not match'
      return;
    }
    if (name.length === 0 || email.length === 0 || pass1.length <= 5) {
      return;
    }
    const res = await fetch('/user/register', { method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email, password: pass1 }) })
    if (res.status === 200) {
      this.setState({ loggedin: true })
      this.setState({ email: email })
      this.props.history.push('/dashboard')
    } else {
      const creationStatus = await res.json();
      this.setState({ errormessage: creationStatus.status })
    }


  }
  openPassModel() {
    this.setState({ forgotPass: true })
  }
  async doForgotPass() {
    document.getElementsByClassName('error-message')[0].innerHTML = ''
    const email = document.getElementById('email').value
    const res = await fetch('/user/resetpasstoken', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) })
    if (res.status !== 200) {
      const resMesage = await res.json()
      document.getElementsByClassName('error-message')[0].innerHTML = resMesage.status
    }

    this.setState({ resetSent: true })


  }
  handleSubmitForgotpass(e) {
    e.preventDefault()
    this.doForgotPass()
  }

  render() {
    return (
      <>
        {!this.state.loggedin && !this.state.forgotPass ?
          <div className="all-container">
            {this.state.displayLogin ?
              <div className="login-container">
                <div className="login-buttons">
                  <button style={{ backgroundColor: 'white' }}>Sign In</button>
                  <button onClick={this.switchActive}>Sign Up</button>
                </div>

                <form className="login-info" onSubmit={this.dosignin}>
                  <div>
                    <input autoComplete="off" spellCheck={false} id='username' placeholder="Email" className="input-info"></input>
                  </div>
                  <div>
                    <input type='password' autoComplete="new-password" id='password' placeholder="Password" className="input-info"></input>
                  </div>
                  <div className='remember-container'>

                    <label className='remember-label' htmlFor='remember' style={{ color: 'white', userSelect: 'none' }}>Remember me
                  <input type='checkbox' id='remember' className='remember'></input>
                      <span className='checkmark'></span>
                    </label>

                    <span onClick={this.openPassModel}>Forgot password</span>
                  </div>

                  <button className='submit-button'>Login</button>

                </form>
                <div className='error-message'>{this.state.errormessage}</div>

              </div>
              : <div className="signup-container">
                <div className="login-buttons">
                  <button onClick={this.switchActive}>Sign In</button>
                  <button style={{ backgroundColor: 'white' }} >Sign Up</button>
                </div>
                <form className="login-info" onSubmit={this.dosignup}>
                  <div className="inf-con">
                    <input autoComplete="off" spellCheck={false} id='username' placeholder="Username" className="input-info"></input>
                    <span id="name-error" className="error-span"></span>
                  </div>
                  <div className="inf-con">
                    <input autoComplete="off" spellCheck={false} id='email' placeholder="Email" className="input-info"></input>
                    <span id="email-error" className="error-span"></span>
                  </div>
                  <div className="inf-con">
                    <input type='password' autoComplete="new-pass" id='password' placeholder="Password" className="input-info"></input>
                    <span id="password-error" className="error-span"></span>
                  </div>
                  <div className="inf-con">
                    <input type='password' autoComplete="new-confirm" id='password-confirm' placeholder="Confirm password" className="input-info"></input>
                    <span id="password-confirm-error" className="error-span"></span>
                  </div>
                  <button className='submit-button'>Sign Up</button>
                </form>
                <div className='error-message'>{this.state.errormessage}</div>

              </div>

            }

          </div>
          : <>{!this.state.resetSent ?
            <div className="forgotpass-container">
              <div className="inside-container">
                <div className="forgotpassinf-con">
                  <form onSubmit={this.handleSubmitForgotpass}>
                    <input autoComplete="off" spellCheck={false} id='email' placeholder="Email" className="input-info"></input>
                  </form>
                </div>
                <div className='error-message' style={{ top: '6rem' }}>{this.state.errormessage}</div>
                <button onClick={this.doForgotPass}>Send Email</button>
              </div>
            </div>
            :
            <div className="forgotpass-container">
              <div className="inside-container">
                <h1>Email Sent</h1>
              </div>
            </div>}
          </>}
      </>
    )
  }
}


export default home