"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type User = {
  first_name: string;
  middle_name: string;
  last_name: string;
  loc: string;
  pinCode: string;
  st: string;
  password: string;
  branch_id: string;
  cpassword?: string;
};

export const AddCustomerForm = ({
  branch_id,
  loadUsers,
}: {
  branch_id: string;
  loadUsers: () => void;
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    first_name: "",
    middle_name: "",
    last_name: "",
    loc: "",
    pinCode: "",
    st: "",
    password: "",
    branch_id,
    cpassword: "",
  });

  const onAddCustomer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch("/api/adduser", {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    })
      .then((res) => res.json())
      .then((res: { id: string, error?: boolean }) => {
        if(res.error){
          alert("You have been logged out");
          router.push("/");
        }
        loadUsers();
        alert("User Created Successfully, user_id : " + res.id);
        setUser({
          first_name: "",
          middle_name: "",
          last_name: "",
          loc: "",
          pinCode: "",
          st: "",
          password: "",
          branch_id,
        });
      })
      .catch((err) => {
        alert("Error adding user, " + err.message);
      });
  };

  return (
    <form onSubmit={onAddCustomer} className="flex flex-col items-center">
      <h3 className="text-xl mb-4">Add a customer</h3>
      <div className="grid grid-cols-2 gap-2">
        <label htmlFor="add:name">First Name*</label>
        <input
          value={user.first_name}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, first_name: e.target.value }))
          }
          id="add:name"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter First Name"
          required
        />
        <label htmlFor="add:mname">Middle Name</label>
        <input
          value={user.middle_name}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, middle_name: e.target.value }))
          }
          id="add:mname"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter Middle Name"
        />
        <label htmlFor="add:lname">Last Name*</label>
        <input
          value={user.last_name}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, last_name: e.target.value }))
          }
          id="add:lname"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter Last Name"
        />
        <label htmlFor="add:addr">Address</label>
        <input
          value={user.loc}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, loc: e.target.value }))
          }
          id="add:addr"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter Street Address"
        />
        <label htmlFor="add:pnc">Pin Code*</label>
        <input
          value={user.pinCode}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, pinCode: e.target.value }))
          }
          id="add:pnc"
          type="number"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter Pin Code"
          required
        />
        <label htmlFor="add:st">State*</label>
        <input
          value={user.st}
          onChange={(e) => setUser((prev) => ({ ...prev, st: e.target.value }))}
          id="add:st"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter State"
          required
        />
        <label htmlFor="add:pass">Password*</label>
        <input
          value={user.password}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, password: e.target.value }))
          }
          type="password"
          id="add:pass"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter Password"
          required
        />
        <label htmlFor="add:cpass">Confirm Password*</label>
        <div>

        <input
          value={user.cpassword}
          type="password"
          onChange={(e) =>
            setUser((prev) => ({ ...prev, cpassword: e.target.value }))
          }
          id="add:cpass"
          className="px-2 py-1 border border-slate-200"
          placeholder="Enter Password"
          required
          />
          {user.cpassword !== user.password ? <p className="text-red-500 text-sm">Passwords do not match</p> : null}
          </div>
        
      </div>
      <div className="flex justify-end mt-2 w-full">
        <button
          className="px-2 py-1 border border-slate-200 hover:bg-slate-100"
          type="submit"
        >
          Add Customer
        </button>
      </div>
    </form>
  );
};
