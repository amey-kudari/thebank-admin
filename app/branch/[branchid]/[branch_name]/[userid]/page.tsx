"use client";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { USER_KEYS, USER_DB_KEYS, DIV_CLASSNAME } from "../constants";
import { ArrowLeftRight } from "lucide-react";
import type { Transaction } from "./types";
import { UserTransactions } from "./components/UserTransactions";

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
  const [tloading, setTloading] = useState(false);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);

  const loadUserTransactions = useCallback(() => {
    setTloading(true);
    fetch(`/api/transactions?from_id=${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setUserTransactions(res);
      })
      .catch((err) => {
        alert("Error Loading transactions " + err.message);
      })
      .finally(() => setTloading(false));
  }, [userid]);

  const getUser = useCallback(() => {
    setLoading(true);
    fetch(`/api/user?userid=${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    })
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
      fetch(`/api/${state.toLowerCase()}?userid=${userid}&amount=${amount}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          getUser();
          if (res.error) {
            alert(`Error: ${res.message}`);
          } else {
            alert(`${state} registered successfully`);
          }
        })
        .catch((err) => {
          alert("Error " + err.message);
        });
    } else {
      alert("Invalid amount");
    }
  };

  useEffect(loadUserTransactions, [loadUserTransactions]);
  useEffect(getUser, [getUser]);

  const [view, setView] = useState<"VC" | "RT" | "DW">("VC");

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
              <div className={`${DIV_CLASSNAME}`}>
                <div className="flex gap-4 flex-col sm:flex-row">
                  <button
                    className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
                      view === "VC" ? "bg-slate-300" : ""
                    }`}
                    onClick={() => setView("VC")}
                  >
                    Customer Details
                  </button>
                  <button
                    className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
                      view === "RT" ? "bg-slate-300" : ""
                    }`}
                    onClick={() => setView("RT")}
                  >
                    Recent Transactions
                  </button>
                  <button
                    className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
                      view === "DW" ? "bg-slate-300" : ""
                    }`}
                    onClick={() => setView("DW")}
                  >
                    Deposit / Withdraw
                  </button>
                </div>
              </div>
              {view === "VC" ? (
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
              ) : null}
              {view === "RT" ? (
                <UserTransactions
                  userTransactions={userTransactions}
                  tloading={tloading}
                />
              ) : null}
              {view === "DW" ? (
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
                        title={
                          state === "Deposit"
                            ? "Switch to withdraw"
                            : "Switch to deposit"
                        }
                      >
                        <ArrowLeftRight />
                      </button>
                      <h4 className="text-2xl mb-2">{state} Money</h4>
                    </div>
                    <input
                      value={amount || ""}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="px-2 py-1 border border-slate-200"
                      placeholder="Enter Amount"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 w-1/2 mt-2 border border-slate-200 rounded-md hover:bg-blue-500 hover:text-white"
                    >
                      {state}
                    </button>
                  </form>
                </div>
              ) : null}
            </>
          ) : (
            <h1>Error Loading user</h1>
          )}
        </>
      )}
    </div>
  );
}
