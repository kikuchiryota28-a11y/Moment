"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";
const uuid=(v:string)=>/^[0-9a-f-]{36}$/i.test(v);
export async function reportResult(resultId:string,reason:string):Promise<ActionResult<{reported:boolean}>>{
 if(!uuid(resultId)||reason.trim().length<3||reason.trim().length>500)return{success:false,error:"Please provide a valid report.",code:"INVALID_REPORT"};
 const sb=await createClient();const{data:{user}}=await sb.auth.getUser();if(!user)return{success:false,error:"Authentication required.",code:"AUTH_REQUIRED"};
 const{error}=await sb.from("result_reports").insert({result_id:resultId,reporter_id:user.id,reason:reason.trim()});
 if(error&&error.code!=="23505")return{success:false,error:"Could not send report.",code:"REPORT_FAILED"};
 if(!error)await sb.from("results").update({moderation_status:"REVIEW"}).eq("id",resultId);
 revalidatePath("/world");
 return{success:true,data:{reported:true}};
}
export async function blockUser(blockedId:string):Promise<ActionResult<{blocked:boolean}>>{
 if(!uuid(blockedId))return{success:false,error:"Invalid user.",code:"INVALID_USER"};
 const sb=await createClient();const{data:{user}}=await sb.auth.getUser();if(!user)return{success:false,error:"Authentication required.",code:"AUTH_REQUIRED"};
 if(user.id===blockedId)return{success:false,error:"You cannot block yourself.",code:"INVALID_USER"};
 const{error}=await sb.from("user_blocks").insert({blocker_id:user.id,blocked_id:blockedId});
 if(error&&error.code!=="23505")return{success:false,error:"Could not block this person.",code:"BLOCK_FAILED"};
 return{success:true,data:{blocked:true}};
}
