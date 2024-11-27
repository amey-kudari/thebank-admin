"use client";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { USER_KEYS, USER_DB_KEYS } from "../constants";
import { ArrowLeftRight } from "lucide-react";

export default function Page() {
  const {
    branchid,
    branch_name: branchName,
    userid,
  } = useParams<{
    branchid: string;
    userid: string;
    branch_name: string;
  }>();

  const [user, setUser] = useState<{ [a: string]: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number>();
  const [state, setState] = useState<"Deposit" | "Withdraw">("Deposit");

  // SELECT * FROM Customers WHERE customer_id='i3l-iij'
  const getUser = useCallback(() => {
    setLoading(false);
    fetch(`/api/user?userid=${userid}`)
      .then((res) => res.json())
      .then((res) => setUser(res))
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setLoading(false));
  }, [userid]);

  const updateAmount = (e: FormEvent) => {
    e.preventDefault();
    if (userid && amount && amount > 0) {
      fetch(`/api/${state.toLowerCase()}?userid=${userid}&amount=${amount}`, { method: 'POST' })
        .then((res) => res.json())
        .then((res) => {
          getUser();
          if(res.error){
            alert(`Error: ${res.message}`);
          } else {
            alert(`${state} registered successfully`);
          }
        }).catch((err) => {
          alert("Error " + err.message);
        });
    } else {
      alert("Invalid amount");
    }
  };


  useEffect(getUser, [getUser]);

  return (
    <div className="flex flex-col min-h-[100vh] bg-slate-100 justify-center items-center py-10">
      {loading ? (
        <h1>Loading User...</h1>
      ) : (
        <>
          {user ? (
            <>
              <h1 className="text-3xl">
                {user[USER_DB_KEYS[1]]} {user[USER_DB_KEYS[2]]}{" "}
                {user[USER_DB_KEYS[3]]}
              </h1>
              <h3 className="text-xl mt-2">
                Of branch {branchName.replaceAll("%20", " ")}{" "}
                <small>{branchid}</small>
              </h3>
              <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
                <table>
                  <tbody>
                    {USER_DB_KEYS.map((key, idx) => (
                      <tr key={key} className="border-b">
                        <td className="px-3">{USER_KEYS[idx]}</td>
                        <td>{user[key]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
                <form onSubmit={updateAmount}>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="mr-2"
                      onClick={() =>
                        setState((prev) =>
                          prev === "Deposit" ? "Withdraw" : "Deposit"
                        )
                      }
                    >
                      <ArrowLeftRight />
                    </button>
                    <h4 className="text-2xl mb-2">{state} Money</h4>
                  </div>
                  <input
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    id="add:depamount"
                    className="px-2 py-1 border border-slate-200"
                    placeholder="Enter Amount"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 w-1/2 mt-2 outline-none border border-slate-200 rounded-md hover:bg-blue-500 hover:text-white"
                  >
                    {state}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <h1>Error Loading user</h1>
          )}
        </>
      )}
    </div>
  );
}
