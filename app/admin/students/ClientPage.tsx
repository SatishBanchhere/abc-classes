"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, UserCheck, UserX, Mail, Phone, GraduationCap, Users, Shield, ShieldCheck, CheckSquare, Square } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Student } from "@/types/Student"

export default function StudentsPage({studentsData}: {studentsData: Student[]}) {
    const [students, setStudents] = useState<Student[]>(studentsData)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [isUpdating, setIsUpdating] = useState(false)

    const toggleVerification = async (id: string, currentStatus: boolean) => {
        setIsUpdating(true)
        try {
            const ref = doc(db, "students", id)
            await updateDoc(ref, { isVerified: !currentStatus })
            await fetch("/api/revalidateit?path=/admin/students");

            setStudents((prev) =>
                prev.map((student) => (student.id === id ? { ...student, isVerified: !currentStatus } : student)),
            )
        } catch (error) {
            console.error("Error updating verification:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    const batchVerifyStudents = async (studentIds: string[], verificationStatus: boolean) => {
        setIsUpdating(true)
        try {
            // Process in batches of 500 (Firestore limit)
            const batchSize = 500
            const batches = []

            for (let i = 0; i < studentIds.length; i += batchSize) {
                const batch = writeBatch(db)
                const chunk = studentIds.slice(i, i + batchSize)
                
                chunk.forEach(studentId => {
                    const ref = doc(db, "students", studentId)
                    batch.update(ref, { isVerified: verificationStatus })
                })
                
                batches.push(batch)
            }

            // Execute all batches
            await Promise.all(batches.map(batch => batch.commit()))
            await fetch("/api/revalidateit?path=/admin/students");

            // Update local state
            setStudents((prev) =>
                prev.map((student) =>
                    studentIds.includes(student.id)
                        ? { ...student, isVerified: verificationStatus }
                        : student
                )
            )

            // Clear selection
            setSelectedStudents([])
        } catch (error) {
            console.error("Error batch updating verification:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudents(prev => 
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        )
    }

    const handleSelectAll = () => {
        const currentFilteredIds = filteredStudents.map(student => student.id)
        const allSelected = currentFilteredIds.every(id => selectedStudents.includes(id))
        
        if (allSelected) {
            // Deselect all filtered students
            setSelectedStudents(prev => prev.filter(id => !currentFilteredIds.includes(id)))
        } else {
            // Select all filtered students
            setSelectedStudents(prev => Array.from(new Set([...prev, ...currentFilteredIds])))
        }
    }

    const handleSelectAllUnverified = () => {
        const unverifiedIds = filteredStudents
            .filter(student => !student.isVerified)
            .map(student => student.id)
        
        setSelectedStudents(prev => Array.from(new Set([...prev, ...unverifiedIds])))
        
    }

    const filteredStudents = students
        .filter(
            (student) =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.exam_type.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) => {
            // Unverified students first, then by name
            if (!a.isVerified && b.isVerified) return -1
            if (a.isVerified && !b.isVerified) return 1
            return a.name.localeCompare(b.name)
        })

    const verifiedCount = students.filter((s) => s.isVerified).length
    const totalCount = students.length
    const selectedCount = selectedStudents.length
    const selectedVerifiedCount = selectedStudents.filter(id => 
        students.find(s => s.id === id)?.isVerified
    ).length
    const selectedUnverifiedCount = selectedCount - selectedVerifiedCount

    const allFilteredSelected = filteredStudents.length > 0 && 
        filteredStudents.every(student => selectedStudents.includes(student.id))

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Management</h1>
                <p className="text-gray-600 mb-4">Verify and manage student accounts</p>

                <div className="flex gap-4 mb-6">
                    <Card className="flex-1">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                                    <p className="text-sm text-gray-600">Total Students</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
                                    <p className="text-sm text-gray-600">Verified Students</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="w-8 h-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{totalCount - verifiedCount}</p>
                                    <p className="text-sm text-gray-600">Pending Verification</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedCount > 0 && (
                        <Card className="flex-1">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <CheckSquare className="w-8 h-8 text-purple-600" />
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{selectedCount}</p>
                                        <p className="text-sm text-gray-600">Selected</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search by name, email, or exam type..."
                        className="pl-10 h-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Bulk Action Controls */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="select-all"
                            checked={allFilteredSelected}
                            onCheckedChange={handleSelectAll}
                            disabled={filteredStudents.length === 0}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                            Select All ({filteredStudents.length})
                        </label>
                    </div>

                    <Button 
                        variant="outline" 
                        onClick={handleSelectAllUnverified}
                        disabled={filteredStudents.filter(s => !s.isVerified).length === 0}
                        className="text-sm"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Select All Unverified ({filteredStudents.filter(s => !s.isVerified).length})
                    </Button>

                    {selectedCount > 0 && (
                        <>
                            <div className="h-6 w-px bg-gray-300" />
                            
                            {selectedUnverifiedCount > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={isUpdating}
                                        >
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Verify Selected ({selectedUnverifiedCount})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Verify Selected Students</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to verify {selectedUnverifiedCount} selected students? 
                                                They will gain access to all verified features.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => batchVerifyStudents(
                                                    selectedStudents.filter(id => 
                                                        !students.find(s => s.id === id)?.isVerified
                                                    ), 
                                                    true
                                                )}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Verify All
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            {selectedVerifiedCount > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                            disabled={isUpdating}
                                        >
                                            <UserX className="w-4 h-4 mr-2" />
                                            Unverify Selected ({selectedVerifiedCount})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Unverify Selected Students</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to unverify {selectedVerifiedCount} selected students? 
                                                They will lose access to verified features.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => batchVerifyStudents(
                                                    selectedStudents.filter(id => 
                                                        students.find(s => s.id === id)?.isVerified
                                                    ), 
                                                    false
                                                )}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Unverify All
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedStudents([])}
                                className="text-sm"
                            >
                                Clear Selection
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredStudents.map((student) => (
                    <Card 
                        key={student.id} 
                        className={`hover:shadow-md transition-shadow duration-200 ${
                            selectedStudents.includes(student.id) ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
                        }`}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4 flex-1">
                                    <Checkbox
                                        checked={selectedStudents.includes(student.id)}
                                        onCheckedChange={() => handleSelectStudent(student.id)}
                                        className="mt-1"
                                    />
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-semibold text-gray-900">{student.name}</h3>
                                            {student.isVerified ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4" />
                                                <span>{student.exam_type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{student.phone_number}</span>
                                            </div>
                                            {student.phone_parent && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>Parent: {student.phone_parent}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-4">
                                    {student.isVerified ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                                                    disabled={isUpdating}
                                                >
                                                    <UserX className="w-4 h-4 mr-2" />
                                                    Unverify
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Unverify Student</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to unverify {student.name}? They will lose access to verified
                                                        features.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => toggleVerification(student.id, true)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Unverify
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    className="bg-green-600 hover:bg-green-700"
                                                    disabled={isUpdating}
                                                >
                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                    Verify
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Verify Student</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to verify {student.name}? They will gain access to all verified
                                                        features.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => toggleVerification(student.id, false)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        Verify
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? "No students found" : "No students yet"}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? "Try adjusting your search terms." : "Students will appear here once they register."}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
