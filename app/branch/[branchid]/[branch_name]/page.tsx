"use client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AddCustomerForm } from "./components/AddCustomerForm";
import Link from "next/link";
import { USER_KEYS, USER_DB_KEYS, DIV_CLASSNAME } from "./constants";

const itemRenderer = (item: string, key: string): string => {
  if (key === "Registration Time") {
    const date = new Date(item);
    return `${date.getMonth() < 9 ? 0 : ""}${date.getMonth() + 1}/${
      date.getFullYear() % 100
    }`;
  }
  return item;
};

export default function Page() {
  const { branchid, branch_name: branchName } = useParams<{
    branchid: string;
    branch_name: string;
  }>();
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<object[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [activeKeys, setActiveKeys] = useState(() => {
    const keyobj = Object.fromEntries(USER_KEYS.map((key) => [key, false]));
    keyobj[USER_KEYS[0]] = true;
    keyobj[USER_KEYS[1]] = true;
    keyobj[USER_KEYS[8]] = true;
    keyobj[USER_KEYS[9]] = true;
    return keyobj;
  });

  const loadUsers = useCallback(() => {
    setLoading(true);
    fetch(`/api/users?branchid=${branchid}&offset=${offset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setUsers(
          res.data.map((di: { [key: string]: string }) => ({
            [USER_KEYS[0]]: di[USER_DB_KEYS[0]],
            [USER_KEYS[1]]: di[USER_DB_KEYS[1]],
            [USER_KEYS[2]]: di[USER_DB_KEYS[2]],
            [USER_KEYS[3]]: di[USER_DB_KEYS[3]],
            [USER_KEYS[4]]: di[USER_DB_KEYS[4]],
            [USER_KEYS[5]]: di[USER_DB_KEYS[5]],
            [USER_KEYS[6]]: di[USER_DB_KEYS[6]],
            [USER_KEYS[7]]: di[USER_DB_KEYS[7]],
            [USER_KEYS[8]]: di[USER_DB_KEYS[8]],
            [USER_KEYS[9]]: di[USER_DB_KEYS[9]],
          }))
        );
        setCount(res.count);
        setOffset(res.offset);
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    setLoading(false);
  }, [branchid, offset]);

  useEffect(loadUsers, [loadUsers]);

  const [view, setView] = useState<"VC" | "RC">("VC");

  return (
    <div className="flex flex-col min-h-[100vh] justify-center items-center py-10">
      <h1 className="text-4xl font-light">
        You are logged into{" "}
        <strong className="font-normal">
          {branchName.replaceAll("%20", " ")}
        </strong>
      </h1>
      <div className={`${DIV_CLASSNAME}`}>
        <div className="flex gap-4 flex-col sm:flex-row">
          <button
            className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
              view === "VC" ? "bg-slate-300" : ""
            }`}
            onClick={() => setView("VC")}
          >
            View Customers
          </button>
          <button
            className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
              view === "RC" ? "bg-slate-300" : ""
            }`}
            onClick={() => setView("RC")}
          >
            Register new Customers
          </button>
        </div>
      </div>
      {view === "VC" ? (
        <div className={DIV_CLASSNAME}>
          <h3 className="text-xl">Registered customers</h3>
          <div className="text-right w-full">
            <button onClick={() => setShowFilter((a) => !a)}>Filter</button>
            <ul
              className={`transition-all duration-200 overflow-hidden ${
                showFilter ? "bg-slate-200 p-2 h-64" : "h-0"
              }`}
            >
              {USER_KEYS.map((key) => (
                <li key={key}>
                  <label htmlFor={`filter:${key}`}>{key}</label>{" "}
                  <input
                    type="checkbox"
                    checked={activeKeys[key]}
                    id={`filter:${key}`}
                    tabIndex={showFilter ? 0 : -1}
                    onChange={() => {
                      setActiveKeys((prev) => ({ ...prev, [key]: !prev[key] }));
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-x-auto w-full mt-2">
            <table className="table-layout: auto; table-fixed min-w-full text-center border">
              <thead>
                <tr className="border">
                  {Object.entries(activeKeys).map(([key, show]) =>
                    show ? (
                      <th key={key} className="min-w-12 border px-2 py-1">
                        {key}
                      </th>
                    ) : null
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <tr className="border">
                      <td className="border" colSpan={10}>
                        Loading...
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {users.map((user, i) => (
                      <tr key={i + offset}>
                        {USER_KEYS.map((key) =>
                          activeKeys[key] ? (
                            <td key={key} className="border px-2 py-1">
                              {itemRenderer(
                                (user as unknown as { [a: string]: string })[
                                  key
                                ] ?? "",
                                key
                              )}
                            </td>
                          ) : null
                        )}
                        <td className="border px-2 py-1">
                          <Link
                            href={`/branch/${branchid}/${branchName}/${
                              (user as unknown as { [a: string]: string })[
                                USER_KEYS[0]
                              ]
                            }`}
                          >
                            <button className="border px-2" tabIndex={-1}>
                              Open
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end w-full gap-2 items-center mt-2">
            <button
              className="px-2 py-1 border border-slate-200 hover:bg-slate-100"
              onClick={() => setOffset(offset - 5)}
              disabled={offset === 0}
            >
              Previous
            </button>
            <span>
              {offset + 1} - {offset + 5} of {count}
            </span>
            <button
              className="px-2 py-1 border border-slate-200 hover:bg-slate-100"
              onClick={() => setOffset(offset + 5)}
              disabled={offset + 5 >= count}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className={DIV_CLASSNAME}>
          <AddCustomerForm branch_id={branchid} loadUsers={loadUsers} />
        </div>
      )}
    </div>
  );
}
