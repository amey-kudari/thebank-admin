import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

type User = {
  [a : string] : string | number 
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const userid = searchParams.get('userid');
  const amount = Number(searchParams.get('amount'));
  const sql = neon(process.env.DATABASE_URL ?? '');
  const user = (await sql(`SELECT * FROM Customers WHERE customer_id='${userid}'`))?.[0] as unknown as User;
  if(!amount || !user || amount < 0){
    return NextResponse.json({error: true, message: 'Invalid request'}, {status: 400});
  }
  if(Number(user.balance) < amount){
    return NextResponse.json({error: true, message: 'Insufficient balance'}, {status: 400});
  }
  try {
    const ret = await sql(`UPDATE Customers set balance=${Number(user.balance) - amount} WHERE customer_id='${userid}'`)
    return NextResponse.json({ error : false, ret });
  } catch(err) {
    return NextResponse.json({error: true, err, user, message: 'Database error', q: `UPDATE Customers set balance=${Number(user.balance) - amount} WHERE customer_id='${userid}'`}, {status: 500});
  }
}