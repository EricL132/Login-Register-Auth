
import React from 'react'
import './App.css';
import {BrowserRouter,Switch,Route} from 'react-router-dom'
import Home from './components/pages/home'
import Dashboard from './components/pages/dashboard'
import Permissiondenied from './components/pages/nopermission'
import Resetpass from './components/pages/resetpass'
class App extends React.Component {


  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/' exact component={Home}></Route>
          <Route path='/dashboard' exact component={Dashboard}></Route>
          <Route path='/permissiondenied' exact component={Permissiondenied}></Route>
          <Route path='/resetpassword'>
            <Route path='/:token' component={Resetpass}></Route>
          </Route>
          <Route component={Home}></Route>
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
