import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import md5 from "md5";

const create_token = () => {
  const letters = []
  for(let i=0;i<26;i++){
      letters.push(String.fromCharCode('a'.charCodeAt(0) + i));
  }
  for(let i=0;i<9;i++){
      letters.push(String(i));
  }

  let numid = Date.now();
  const id_l = [];
  const n = letters.length;
  while(numid > 0){
      id_l.push(letters[numid % n]);
      numid = Math.floor(numid / n);
  }
  numid = Math.floor(1e9 * Math.random());
  while(numid > 0){
      id_l.push(letters[numid % n]);
      numid = Math.floor(numid / n);
  }
  let sid = "";
  let c = 0;
  for(const s of id_l){
      c++;
      if(c === 4){
          c = 0;
          sid += '-';
      }
      sid += s;
  }
  return sid.slice(10);
}

export async function POST(req: Request) {
  const body = await req.json();
  const sql = neon(process.env.DATABASE_URL ?? '');
  const user_id = create_token();
  const query = `INSERT INTO CUSTOMERS (customer_id, password_hash, first_name, middle_name, last_name, loc, pinCode, st, credit_limit, credit_usage, credit_score, registration_time, branch_id, balance) VALUES ('${user_id}','${md5(body.password)}','${body.first_name}','${body.middle_name}','${body.last_name}','${body.loc}',${body.pinCode},'${body.st}',0,0,0,'${new Date().toISOString()}','${body.branch_id}',0);`
  try{
    await sql(query);
    return NextResponse.json({id : user_id});
  } catch(err){
    return NextResponse.json({err, message: 'Invalid Request'}, {status: 400});
  }
}