import {createStore} from 'vuex'
import { mutations } from './mutations'

export default createStore({
    state:{
        // sateArr: []
        sateArr:JSON.parse(localStorage.getItem('sateArr'))||[],
    },
    mutations,    
})