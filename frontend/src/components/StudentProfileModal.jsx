import React, { useState } from "react";
import {
  X,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Avatar from "./shared/Avatar";

const StudentProfileModal = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState("COURSE");

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-250 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex gap-4 items-center">
            <Avatar
              name={student.fullname}
              email={student.email}
              src={student.profilePhoto}
              size="xl"
              className="rounded-xl"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {student.fullname}
                </h2>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {student.status}
                </Badge>
              </div>
              <p className="text-slate-500">
                {student.course} • {student.enrollmentId}
              </p>
              <Badge className="bg-green-100 text-green-700 mt-2">
                <Clock className="w-4 h-4 mr-1" />
                {student.attendance}% Attendance
              </Badge>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X />
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-6 px-6 pt-4 border-b">
          {["COURSE", "PROGRESS", "ATTENDANCE"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition ${activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500"
                  }`}
              >
                {tab === "COURSE"
                  ? "Course Information"
                  : tab === "PROGRESS"
                    ? "Progress"
                    : "Attendance"}
              </button>
            )
          )}
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 space-y-6">

          {/* ---------------- COURSE TAB ---------------- */}
          {activeTab === "COURSE" && (
            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    Weekly Activity
                  </h3>
                  <div className="h-40 flex items-end gap-4">
                    {[40, 70, 50, 90, 60, 30, 20].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="bg-indigo-600 w-8 rounded-md"
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">
                    Contact Info
                  </h3>
                  <div className="flex gap-2 items-center text-sm">
                    <Mail className="w-4 h-4" />
                    {student.email}
                  </div>
                  <div className="flex gap-2 items-center text-sm">
                    <Phone className="w-4 h-4" />
                    {student.phone}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ---------------- PROGRESS TAB ---------------- */}
          {activeTab === "PROGRESS" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-indigo-600">
                      88%
                    </div>
                    <p className="text-slate-500 mt-2">
                      Overall Progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-slate-500">
                      Assignments
                    </p>
                    <p className="text-2xl font-bold">
                      24 / 28
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-slate-500">
                      Quizzes
                    </p>
                    <p className="text-2xl font-bold">
                      12 / 12
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ---------------- ATTENDANCE TAB ---------------- */}
          {activeTab === "ATTENDANCE" && (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">
                    Date-wise History
                  </h3>
                  <div className="flex justify-between bg-slate-50 p-3 rounded-lg">
                    <span>Feb 18, 2026</span>
                    <Badge className="bg-green-100 text-green-700">
                      PRESENT
                    </Badge>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-3 rounded-lg">
                    <span>Feb 16, 2026</span>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      LATE
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">
                    Module-wise Attendance
                  </h3>
                  <div>
                    <p className="text-sm">
                      React Development
                    </p>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-indigo-600 w-[88%] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">
                      Backend with Node
                    </p>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div className="h-2 bg-red-500 w-[72%] rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
