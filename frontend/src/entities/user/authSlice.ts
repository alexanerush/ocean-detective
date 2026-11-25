import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
export type User = { id: string; email: string };
const initialState: {status:'checking'|'anonymous'|'authenticated';user:User|null}={status:'checking',user:null};
const slice=createSlice({name:'auth',initialState,reducers:{signedOut:()=>({status:'anonymous' as const,user:null}),signedIn:(_state,action:PayloadAction<User>)=>({status:'authenticated' as const,user:action.payload})}});
export const {signedIn,signedOut}=slice.actions;
export default slice.reducer;
