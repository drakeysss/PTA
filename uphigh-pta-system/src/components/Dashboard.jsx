import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { studentAPI, paymentAPI } from '../services/api'

const Dashboard = () => {
  const { logout } = useAuth()

  const [isSearching, setIsSearching] = useState(false)

  const [studentInfo, setStudentInfo] = useState({
    name: '',
    gradeLevel: '',
    studentType: '',
    organization: '',
    paymentsDue: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [foundStudent, setFoundStudent] = useState(null)
  const [setShowWelcome] = useState(true)
  const [runningTotal, setRunningTotal] = useState(0)


  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const searchStudent = async (name) => {
    if (name.length <= 2) {
      setFoundStudent(null)
      setStudentInfo({
        name: '',
        gradeLevel: '',
        studentType: '',
        organization: '',
        paymentsDue: []
      })
      return;
    }

    try {
      const result = await studentAPI.search(name)

      if (result.success && result.data.students.length > 0) {
        const student = result.data.students[0] // Take first match

        // Get student with payment details
        const detailResult = await studentAPI.getById(student.ID)

        if (detailResult.success) {
          const studentData = detailResult.data.student
          setFoundStudent(studentData)
          setStudentInfo({
            id: studentData.id,
            name: studentData.student_name,
            gradeLevel: studentData.grade_level,
            studentType: studentData.student_type,
            organization: studentData.organization || '',
            paymentsDue: studentData.payments_due || []
          })
        }
      } else {
        setFoundStudent(null)
        setStudentInfo({
          name: name,
          gradeLevel: '',
          studentType: '',
          organization: '',
          paymentsDue: []
        })
      }
    } catch (error) {

      setFoundStudent(null)
      setStudentInfo({
        name: name,
        gradeLevel: '',
        studentType: '',
        organization: '',
        paymentsDue: []
      })
    }
  }

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s\.\-\']/g, '')
    setSearchQuery(value)
  }

  const handleSearch = async () => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true)
      await searchStudent(searchQuery.trim())
      setIsSearching(false)
    } else {
      setFoundStudent(null)
      setStudentInfo({
        name: '',
        gradeLevel: '',
        studentType: '',
        organization: '',
        paymentsDue: []
      })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getTotalAmount = () => {
    return studentInfo.paymentsDue.reduce((sum, payment) => sum + payment.amount, 0)
  }



  const handlePayment = async () => {
    const totalDue = getTotalAmount()

    if (totalDue <= 0) {
      alert('No payments due for this student.')
      return
    }

    if (!studentInfo.id) {
      alert('Please select a student first.')
      return
    }

    try {
      // Prepare payment items
      const paymentItems = studentInfo.paymentsDue.map(payment => ({
        student_payment_due_id: payment.id,
        payment_type_id: payment.payment_type_id || 1, // Default to 1 if not available
        amount: payment.amount
      }))

      const paymentData = {
        student_id: studentInfo.id,
        total_amount: totalDue,
        payment_method: 'Cash',
        payment_items: paymentItems,
        notes: `Payment for ${studentInfo.name}`
      }

      const result = await paymentAPI.processPayment(paymentData)

      if (result.success) {
        alert(`Payment of ₱${totalDue.toFixed(2)} received successfully!\nReceipt: ${result.data.receipt_number}`)

        // Update running total and clear student info
        setRunningTotal(prevTotal => prevTotal + totalDue)
        setFoundStudent(null)
        setStudentInfo({
          name: '',
          gradeLevel: '',
          studentType: '',
          organization: '',
          paymentsDue: []
        })
        setSearchQuery('')
        setShowWelcome(false)
      } else {
        alert(`Payment failed: ${result.error}`)
      }
    } catch (error) {

      alert('Payment processing failed. Please try again.')
    }
  }



            return (
              <div className="vh-100 d-flex flex-column bg-light">
                <nav className="navbar navbar-up-theme px-3 py-2 shadow">
                  <div className="container-fluid d-flex justify-content-between align-items-left">
                    <div>
                      <h4 className="mb-0 text-white">🏛️ PTA Cashier System</h4>
                      <small className="text-up-gold">University of the Philippines</small>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      {/* {showWelcome && (
                        // <span className="badge badge-white px-3 py-2">Welcome, {currentUser?.name}!</span>
                      )} */}
                      <span className="badge badge- text-white px-3 py-2 fs-6">Running Total: ₱{runningTotal.toFixed(2)}</span>

                      <button className="btn btn-outline-light btn-sm border-2" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </div>
                </nav>

                <main className="d-flex align-items-start justify-content-start px-2 pt-4 pb-5 bg-up-light-gray">
                  <div className="container-fluid px-2">
                    <div className="row w-100 g-3">
                      <div className="col-lg-6">
                        <div className="card card-up-theme shadow h-100">
                          <div className="card-header card-header-up-forest-green text-start">
                            <h5 className="mb-0 text-center">Student Search</h5>
                          </div>
                          <div className="card-body text-start">
                            <div className="mb-3">
                              <label className="form-label text-up-maroon fw-bold d-block text-start">Search Student Name</label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control text-start"
                                  value={searchQuery}
                                  onChange={handleNameChange}
                                  onKeyDown={handleKeyPress}
                                  placeholder="Search Student Name"
                                  pattern="[a-zA-Z\s.\-']+"
                                  title="Please enter letters only"
                                />
                                <button
                                  className="btn btn-up-forest-green"
                                  type="button"
                                  onClick={handleSearch}
                                  disabled={searchQuery.trim().length <= 2 || isSearching}
                                >
                                  {isSearching ? 'Searching...' : 'Search'}
                                </button>
                              </div>
                              {searchQuery.length > 2 && !foundStudent && (
                                <small className="text-muted d-block text-start"></small>
                              )}
                              {foundStudent && (
                                <small className="text-success d-block text-start">✓ Student found. Check details on the right.</small>
                              )}
                              {searchQuery.length > 0 && searchQuery.length <= 1 && (
                                <small className="text-muted d-block text-start">Please enter characters to search.</small>
                              )}
                            </div>

                            {foundStudent && (
                              <>
                                <hr className="border-up-forest-green" />
                                <h6 className="text-up-forest-green mb-3 text-start">Student Information</h6>
                                <div className="mb-2 d-flex text-start">
                                  <strong className="text-up-maroon" style={{minWidth: '100px'}}>Student:</strong>
                                  <span className="text-up-forest-green ms-2">{studentInfo.name}</span>
                                </div>
                                <div className="mb-2 d-flex text-start">
                                  <strong className="text-up-maroon" style={{minWidth: '100px'}}>Grade Level:</strong>
                                  <span className="text-up-forest-green ms-2">{studentInfo.gradeLevel}</span>
                                </div>
                                <div className="mb-2 d-flex text-start">
                                  <strong className="text-up-maroon" style={{minWidth: '100px'}}>Student Type:</strong>
                                  <span className="badge badge-up-forest-green ms-2">{studentInfo.studentType}</span>
                                </div>
                                {studentInfo.organization && (
                                  <div className="mb-2 d-flex text-start">
                                    <strong className="text-up-maroon" style={{minWidth: '120px'}}>Organization:</strong>
                                    <span className="text-up-forest-green ms-2">{studentInfo.organization}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="card card-up-theme shadow h-100">
                          <div className="card-header card-header-up-maroon">
                            <h5 className="mb-0">Payment Details</h5>
                          </div>
                          <div className="card-body">
                            {!foundStudent ? (
                              <div className="text-center py-5">
                                <div className="text-muted">
                                  <i className="fas fa-search fa-3x mb-5"></i>
                                  <h5>No Payment Details</h5>
                                  <p>Search for a student on the left to view their payment details.</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="mb-3">
                                  {studentInfo.paymentsDue.length === 0 ? (
                                    <div className="alert alert-up-info text-center py-3">
                                      No payments due
                                    </div>
                                  ) : (
                                    <>
                                      {studentInfo.paymentsDue.map((payment, index) => (
                                        <div key={index} className="d-flex justify-content-between align-items-center mb-1 p-2 border rounded bg-light">
                                          <span className="text-up-forest-green fw-bold">{payment.description}</span>
                                          <span className="text-up-maroon fw-bold fs-10">₱{payment.amount.toFixed(2)}</span>
                                        </div>
                                      ))}
                                      <div className="d-flex justify-content-between align-items-center mt-2 p-2 bg-up-maroon text-white rounded">
                                        <strong>Total Amount Due:</strong>
                                        <strong className="fs-10 text-up-gold">₱{getTotalAmount().toFixed(2)}</strong>
                                      </div>

                                      
                                      <div className="mt-3">
                                        <button className="btn btn-up-maroon  w-100 fw-bold" onClick={handlePayment}>Pay</button>
                                          </div>
                                                          </>
                                                        )}
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </main>
                                    </div>
                                    )
                                    }

                  export default Dashboard
