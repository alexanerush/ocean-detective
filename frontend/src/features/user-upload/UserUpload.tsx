import RunAnalysis from '../ml-results/RunAnalysis';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/providers/store/hooks';
import { apiClient } from '../../shared/api/apiClient';
import { Button, Panel } from '../../shared/ui/controls';
export default function UserUpload({file}:{file:File|null}){
 const auth=useAppSelector(s=>s.auth.status);
 const [imageId,setImageId]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[progress,setProgress]=useState(0);
 async function send(){if(!file)return;setBusy(true);setMessage('');setError('');setProgress(0);try{const body=new FormData();body.append('image',file);const response=await apiClient.post<{image:{image_id:string}}>('/images',body,{onUploadProgress:e=>{if(e.total)setProgress(Math.round(e.loaded/e.total*100));}});setImageId(String(response.data.image.image_id));setMessage('Image validated and saved.');}catch(e){setError(e instanceof Error?e.message:'Upload failed');}finally{setBusy(false);}}
 return <Panel title="User image upload"><p>Save a validated GeoTIFF to your private workspace.</p>{auth==='authenticated'?<Button disabled={!file||busy} onClick={()=>void send()}>{busy?'Uploading / validating…':'Upload image'}</Button>:<Link to="/login">Sign in to upload</Link>}{busy&&<p role="status">Transfer: {progress}% — validating on server</p>}{message&&<p role="status">{message} <Link to="/history">View history</Link></p>}{error&&<p role="alert">{error}</p>}{auth==='authenticated'&&imageId&&<RunAnalysis key={imageId} imageId={imageId}/>}</Panel>;
}
