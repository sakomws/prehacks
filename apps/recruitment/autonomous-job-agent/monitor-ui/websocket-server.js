const { Server } = require('socket.io')
const http = require('http')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

// Load test data
let testData = {}
try {
  const testDataPath = path.join(__dirname, '..', 'data', 'test_data.json')
  const testDataRaw = fs.readFileSync(testDataPath, 'utf8')
  testData = JSON.parse(testDataRaw)
  console.log('✅ Loaded test data from:', testDataPath)
} catch (error) {
  console.error('❌ Failed to load test data:', error.message)
  // Fallback to default data
  testData = {
    personal_information: {
      first_name: "[REDACTED]",
      last_name: "[REDACTED]",
      email: "[REDACTED]",
      phone: "[REDACTED]"
    }
  }
}

// Generate realistic responses for different question types using test data
function generateResponse(question) {
  const responses = {
    // Personal Information
    'first_name': { response: testData.personal_information?.first_name || '[REDACTED]', response_type: 'text' },
    'last_name': { response: testData.personal_information?.last_name || '[REDACTED]', response_type: 'text' },
    'email': { response: testData.personal_information?.email || '[REDACTED]', response_type: 'email' },
    'phone': { response: testData.personal_information?.phone || '[REDACTED]', response_type: 'phone' },
    'address': { response: testData.personal_information?.address?.line || '[REDACTED]', response_type: 'text' },
    'city': { response: testData.personal_information?.address?.city || '[REDACTED]', response_type: 'text' },
    'state': { response: testData.personal_information?.address?.state || '[REDACTED]', response_type: 'text' },
    'zip_code': { response: testData.personal_information?.address?.postal_code || '[REDACTED]', response_type: 'text' },
    'country': { response: testData.personal_information?.address?.country || 'United States', response_type: 'select' },
    
    // Eligibility
    'over_18': { response: testData.eligibility?.over_18 ? 'Yes' : 'No', response_type: 'radio' },
    'eligible_to_work': { response: testData.eligibility?.eligible_to_work_in_us ? 'Yes' : 'No', response_type: 'radio' },
    'require_sponsorship': { response: testData.eligibility?.require_sponsorship ? 'Yes' : 'No', response_type: 'radio' },
    'license': { response: testData.eligibility?.professional_license ? 'Yes' : 'No', response_type: 'radio' },
    
    // Experience
    'years_experience': { response: testData.experience?.years_related_role || '8+ years', response_type: 'select' },
    
    // Motivation
    'what_drew_you_to_healthcare': { 
      response: testData.motivation?.what_drew_you_to_healthcare || 'I am deeply motivated by the opportunity to improve lives through technology, secure systems, and innovation. Healthcare offers a chance to apply my skills in AI, security, and platform engineering to ensure reliability, safety, and efficiency for patients and providers.', 
      response_type: 'textarea' 
    },
    
    // Voluntary Disclosures
    'gender': { response: testData.voluntary_disclosures?.gender || 'Male', response_type: 'select' },
    'race': { response: testData.voluntary_disclosures?.race || 'White (Not Hispanic or Latino)', response_type: 'select' },
    'hispanic': { response: testData.voluntary_disclosures?.hispanic_or_latino ? 'Yes' : 'No', response_type: 'radio' },
    'veteran': { response: testData.voluntary_disclosures?.veteran_status === 'Not a Veteran' ? 'No' : 'Yes', response_type: 'radio' },
    'disability': { response: testData.voluntary_disclosures?.disability_status?.includes('No') ? 'No' : 'Yes', response_type: 'radio' },
    
    // Default responses for other fields
    'current_title': { response: 'Senior Software Engineer', response_type: 'text' },
    'current_company': { response: 'Tech Corp Inc.', response_type: 'text' },
    'linkedin': { response: 'https://linkedin.com/in/sakom', response_type: 'url' },
    'website': { response: 'https://sakom.dev', response_type: 'url' },
    'availability': { response: 'Available immediately for full-time position', response_type: 'textarea' },
    'interest': { response: 'I am excited about this opportunity to contribute to your innovative team and grow my career in software engineering.', response_type: 'textarea' },
    'salary': { response: '$120,000 - $140,000', response_type: 'text' },
    'start_date': { response: 'Available in 2 weeks', response_type: 'text' },
    'referral': { response: 'Company website', response_type: 'select' },
    'questions': { response: 'What opportunities are there for professional development and career growth?', response_type: 'textarea' },
    'emergency_contact': { response: 'Emergency Contact', response_type: 'text' },
    'emergency_phone': { response: '+1 (555) 987-6543', response_type: 'phone' },
    'relocate': { response: 'Yes, willing to relocate', response_type: 'radio' },
    'transportation': { response: 'Yes, reliable transportation', response_type: 'radio' },
    'weekends': { response: 'Yes, available weekends', response_type: 'radio' },
    'overtime': { response: 'Yes, available for overtime', response_type: 'radio' },
    'criminal': { response: 'No', response_type: 'radio' },
    'references': { response: 'Available upon request', response_type: 'textarea' },
    'comments': { response: 'Thank you for considering my application. I look forward to discussing this opportunity further.', response_type: 'textarea' }
  }
  
  return responses[question.question_id] || { response: 'Agent response', response_type: 'text' }
}

// Simulate dynamic form field detection based on job URL
function simulateFormFieldDetection(jobUrl) {
  // Simulate different complexity levels based on job site patterns
  let baseComplexity = 8 // Base number of common fields
  let additionalComplexity = 0
  
  // Analyze URL patterns to determine form complexity
  if (jobUrl.includes('apply.appcast.io') || jobUrl.includes('healthcare')) {
    additionalComplexity = Math.floor(Math.random() * 15) + 10 // 10-25 additional fields
  } else if (jobUrl.includes('smartrecruiters.com') || jobUrl.includes('retail')) {
    additionalComplexity = Math.floor(Math.random() * 8) + 5 // 5-13 additional fields
  } else if (jobUrl.includes('indeed.com') || jobUrl.includes('linkedin.com')) {
    additionalComplexity = Math.floor(Math.random() * 3) + 2 // 2-5 additional fields
  } else if (jobUrl.includes('glassdoor.com') || jobUrl.includes('ziprecruiter.com')) {
    additionalComplexity = Math.floor(Math.random() * 6) + 3 // 3-9 additional fields
  } else {
    // Generic job site - moderate complexity
    additionalComplexity = Math.floor(Math.random() * 10) + 5 // 5-15 additional fields
  }
  
  const totalQuestions = baseComplexity + additionalComplexity
  
  // Common form fields that appear in most job applications
  const commonFields = [
    { text: 'First Name', type: 'text_input', required: true, id: 'first_name' },
    { text: 'Last Name', type: 'text_input', required: true, id: 'last_name' },
    { text: 'Email Address', type: 'email_input', required: true, id: 'email' },
    { text: 'Phone Number', type: 'tel_input', required: true, id: 'phone' },
    { text: 'Address', type: 'text_input', required: true, id: 'address' },
    { text: 'City', type: 'text_input', required: true, id: 'city' },
    { text: 'State/Province', type: 'text_input', required: true, id: 'state' },
    { text: 'ZIP/Postal Code', type: 'text_input', required: true, id: 'zip_code' },
    { text: 'Country', type: 'select', required: true, id: 'country' },
    { text: 'Are you over 18?', type: 'radio_group', required: true, id: 'over_18' },
    { text: 'Are you eligible to work in the United States?', type: 'radio_group', required: true, id: 'eligible_to_work' },
    { text: 'Do you require sponsorship?', type: 'radio_group', required: true, id: 'require_sponsorship' },
    { text: 'Years of experience', type: 'select', required: true, id: 'years_experience' },
    { text: 'Current Job Title', type: 'text_input', required: false, id: 'current_title' },
    { text: 'Current Company', type: 'text_input', required: false, id: 'current_company' },
    { text: 'LinkedIn Profile', type: 'url_input', required: false, id: 'linkedin' },
    { text: 'Personal Website', type: 'url_input', required: false, id: 'website' },
    { text: 'Upload Resume', type: 'file_upload', required: true, id: 'resume_upload' },
    { text: 'Cover Letter', type: 'textarea', required: false, id: 'cover_letter' }
  ]
  
  // Additional fields that might appear based on job type and company
  const additionalFields = [
    { text: 'What is your availability?', type: 'textarea', required: true, id: 'availability' },
    { text: 'Why are you interested in this position?', type: 'textarea', required: true, id: 'interest' },
    { text: 'What is your expected salary?', type: 'text_input', required: false, id: 'salary' },
    { text: 'When can you start?', type: 'text_input', required: false, id: 'start_date' },
    { text: 'Do you have a professional license?', type: 'radio_group', required: false, id: 'license' },
    { text: 'Do you have a disability?', type: 'radio_group', required: false, id: 'disability' },
    { text: 'Are you a veteran?', type: 'radio_group', required: false, id: 'veteran' },
    { text: 'Gender', type: 'select', required: false, id: 'gender' },
    { text: 'Race/Ethnicity', type: 'select', required: false, id: 'race' },
    { text: 'Are you Hispanic or Latino?', type: 'radio_group', required: false, id: 'hispanic' },
    { text: 'How did you hear about this position?', type: 'select', required: false, id: 'referral' },
    { text: 'Do you have any questions for us?', type: 'textarea', required: false, id: 'questions' },
    { text: 'Emergency Contact Name', type: 'text_input', required: false, id: 'emergency_contact' },
    { text: 'Emergency Contact Phone', type: 'tel_input', required: false, id: 'emergency_phone' },
    { text: 'Social Security Number', type: 'text_input', required: false, id: 'ssn' },
    { text: 'Date of Birth', type: 'date_input', required: false, id: 'dob' },
    { text: 'Driver\'s License Number', type: 'text_input', required: false, id: 'license_number' },
    { text: 'Are you willing to relocate?', type: 'radio_group', required: false, id: 'relocate' },
    { text: 'Do you have reliable transportation?', type: 'radio_group', required: false, id: 'transportation' },
    { text: 'Can you work weekends?', type: 'radio_group', required: false, id: 'weekends' },
    { text: 'Can you work overtime?', type: 'radio_group', required: false, id: 'overtime' },
    { text: 'Do you have any criminal convictions?', type: 'radio_group', required: false, id: 'criminal' },
    { text: 'Do you have any references?', type: 'textarea', required: false, id: 'references' },
    { text: 'Additional Comments', type: 'textarea', required: false, id: 'comments' }
  ]
  
  // Start with common fields
  const selectedFields = [...commonFields]
  
  // Add random additional fields to reach the target complexity
  const remainingCount = totalQuestions - commonFields.length
  if (remainingCount > 0) {
    const shuffledAdditional = additionalFields.sort(() => 0.5 - Math.random())
    selectedFields.push(...shuffledAdditional.slice(0, remainingCount))
  }
  
  // Convert to the expected format
  return selectedFields.map((field, index) => ({
    question_id: field.id,
    question_text: field.text,
    field_type: field.type,
    required: field.required,
    filled: false
  }))
}

const app = express()
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3000", "http://localhost:8082"],
  credentials: true
}))

// HTTP endpoints for Chrome extension
app.post('/start-agent', (req, res) => {
  const { job_url } = req.body
  console.log(`🚀 HTTP: Starting agent for job: ${job_url}`)
  
  // Broadcast to all connected Socket.IO clients
  io.emit('start_agent', { job_url })
  
  res.json({ success: true, message: 'Agent start signal sent' })
})

app.post('/progress', (req, res) => {
  const progressData = req.body
  console.log(`📊 HTTP: Progress update:`, progressData)
  
  // Broadcast to all connected Socket.IO clients
  io.emit('progress_update', progressData)
  
  res.json({ success: true, message: 'Progress update sent' })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['polling', 'websocket']
})

// Store active agent sessions
const activeSessions = new Map()
let globalActiveSession = null

// Function to stop all other sessions when a new one starts
function stopOtherSessions(currentSocketId) {
  let stoppedCount = 0
  activeSessions.forEach((session, socketId) => {
    if (socketId !== currentSocketId && session.status === 'running') {
      console.log(`🛑 Stopping previous session for socket ${socketId} (job: ${session.jobUrl})`)
      session.status = 'stopped'
      stoppedCount++
      // Notify the client to stop
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit('agent_status', {
          status: 'stopped',
          currentPage: 1,
          progress: 0
        })
        // Don't emit error, just stop the session silently
        console.log(`🔇 Silently stopping session for socket ${socketId}`)
      }
    }
  })
  if (stoppedCount > 0) {
    console.log(`🛑 Stopped ${stoppedCount} previous session(s)`)
  }
}

// Function to broadcast to all connected clients
function broadcastToAllClients(event, data) {
  io.emit(event, data)
  console.log(`📡 Broadcasting ${event} to all clients`)
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  console.log(`Client transport: ${socket.conn.transport.name}`)

  socket.on('start_agent', (data) => {
    console.log(`🚀 Starting agent for job: ${data.job_url}`)
    console.log(`📋 Job URL: ${data.job_url}`)
    
    // Check if this socket already has a running session
    const existingSession = activeSessions.get(socket.id)
    if (existingSession && existingSession.status === 'running') {
      console.log(`⚠️ Socket ${socket.id} already has a running session, stopping it first`)
      existingSession.status = 'stopped'
    }
    
    // Stop other running sessions to prevent mixing
    stopOtherSessions(socket.id)
    
    // Store session info
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session = {
      sessionId: sessionId,
      jobUrl: data.job_url,
      startTime: Date.now(),
      status: 'running',
      actions: [],
      questions: [],
      screenshots: []
    }
    activeSessions.set(socket.id, session)
    globalActiveSession = session

    // Emit initial status to all clients
    broadcastToAllClients('agent_status', {
      status: 'running',
      currentPage: 1,
      progress: 0
    })

    // Start simulation immediately
    console.log(`🚀 Starting simulation for ${data.job_url}`)
    simulateAgentActivity(socket)
  })

  socket.on('stop_agent', () => {
    console.log(`Stopping agent for client: ${socket.id}`)
    
    const session = activeSessions.get(socket.id)
    if (session) {
      session.status = 'idle'
      socket.emit('agent_status', {
        status: 'idle',
        currentPage: 1,
        progress: 0
      })
    }
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    activeSessions.delete(socket.id)
  })
})

// Simulate agent activity for demonstration
function simulateAgentActivity(socket) {
  const session = activeSessions.get(socket.id)
  if (!session) {
    console.log(`❌ No session found for socket ${socket.id}`)
    return
  }

  let actionCount = 0
  const maxActions = 25

  const simulateAction = () => {
    // Check if session is still active
    const currentSession = activeSessions.get(socket.id)
    if (!currentSession || currentSession.status !== 'running') {
      console.log(`❌ Session stopped for socket ${socket.id}`)
      return
    }

    if (actionCount >= maxActions) {
      // Complete the simulation
      broadcastToAllClients('agent_completed', {
        status: 'completed',
        totalActions: actionCount,
        questionsFound: session.questions.length,
        screenshotsTaken: session.screenshots.length
      })
      return
    }

    actionCount++
    
    // Simulate different types of actions
    const actionTypes = [
      'navigate',
      'question_detection', 
      'type_text',
      'click_radio',
      'select_dropdown',
      'screenshot',
      'page_transition_detected'
    ]

    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)]
    const currentPage = actionCount > 15 ? 2 : 1
    const progress = Math.min((actionCount / maxActions) * 100, 100)

        const action = {
          timestamp: Date.now() / 1000,
          action_type: actionType,
          page: currentPage,
          question_id: actionType === 'type_text' ? 'first_name' : undefined,
          value: actionType === 'type_text' ? 'John' : undefined,
          filename: actionType === 'screenshot' ? getActualScreenshotName(actionCount, session.jobUrl) : undefined
        }

    // Add to session
    session.actions.push(action)

    // Emit action to all clients
    console.log(`🎬 Emitting action for session ${session.sessionId}:`, action.action_type)
    broadcastToAllClients('agent_action', action)

    // Emit status update to all clients
    broadcastToAllClients('agent_status', {
      status: 'running',
      currentPage: currentPage,
      progress: progress
    })

        // Simulate dynamic question detection
        if (actionType === 'question_detection' && session.questions.length === 0) {
          // Simulate real-time form field detection
          const detectedQuestions = simulateFormFieldDetection(session.jobUrl)
          
          session.questions = detectedQuestions
          console.log(`📋 Emitting ${detectedQuestions.length} questions for session ${session.sessionId}`)
          broadcastToAllClients('questions_detected', detectedQuestions)
          console.log(`📋 Dynamically detected ${detectedQuestions.length} questions for job: ${session.jobUrl}`)
        }

    // Simulate screenshot
    if (actionType === 'screenshot') {
      session.screenshots.push(action.filename)
      console.log(`📸 Emitting screenshot for session ${session.sessionId}: ${action.filename}`)
      broadcastToAllClients('screenshot_taken', {
        filename: action.filename,
        sessionId: session.sessionId,
        jobUrl: session.jobUrl
      })
    }

    // Simulate page transition
    if (actionType === 'page_transition_detected') {
      broadcastToAllClients('page_transition', 2)
    }

    // Update question filled status
    if ((actionType === 'type_text' || actionType === 'click_radio' || actionType === 'select_dropdown') && action.question_id) {
      const question = session.questions.find(q => q.question_id === action.question_id)
      if (question) {
        question.filled = true
        // Generate realistic response
        console.log(`🔍 Generating response for question: ${question.question_id}`)
        const response = generateResponse(question)
        console.log(`📝 Generated response: ${response.response} (${response.response_type})`)
        question.response = response.response
        question.response_type = response.response_type
        broadcastToAllClients('questions_detected', session.questions)
      }
    }
    
    // Simulate filling random questions as the agent progresses
    if (actionType === 'type_text' && Math.random() < 0.3) {
      const unfilledQuestions = session.questions.filter(q => !q.filled && q.field_type === 'text_input')
      if (unfilledQuestions.length > 0) {
        const randomQuestion = unfilledQuestions[Math.floor(Math.random() * unfilledQuestions.length)]
        randomQuestion.filled = true
        console.log(`🔍 Random filling question: ${randomQuestion.question_id}`)
        const response = generateResponse(randomQuestion)
        console.log(`📝 Random response: ${response.response} (${response.response_type})`)
        randomQuestion.response = response.response
        randomQuestion.response_type = response.response_type
        broadcastToAllClients('questions_detected', session.questions)
      }
    }
    
    if (actionType === 'click_radio' && Math.random() < 0.4) {
      const unfilledRadioQuestions = session.questions.filter(q => !q.filled && q.field_type === 'radio_group')
      if (unfilledRadioQuestions.length > 0) {
        const randomQuestion = unfilledRadioQuestions[Math.floor(Math.random() * unfilledRadioQuestions.length)]
        randomQuestion.filled = true
        const response = generateResponse(randomQuestion)
        randomQuestion.response = response.response
        randomQuestion.response_type = response.response_type
        broadcastToAllClients('questions_detected', session.questions)
      }
    }
    
    if (actionType === 'select_dropdown' && Math.random() < 0.3) {
      const unfilledSelectQuestions = session.questions.filter(q => !q.filled && q.field_type === 'select')
      if (unfilledSelectQuestions.length > 0) {
        const randomQuestion = unfilledSelectQuestions[Math.floor(Math.random() * unfilledSelectQuestions.length)]
        randomQuestion.filled = true
        const response = generateResponse(randomQuestion)
        randomQuestion.response = response.response
        randomQuestion.response_type = response.response_type
        broadcastToAllClients('questions_detected', session.questions)
      }
    }

    // Schedule next action
    setTimeout(simulateAction, Math.random() * 2000 + 500) // 0.5-2.5 seconds
  }

  // Start simulation
  setTimeout(simulateAction, 1000)
}

// Function to get actual screenshot names based on job URL
function getActualScreenshotName(actionCount, jobUrl) {
  let actualScreenshots = []
  let jobType = 'unknown'
  
  // More precise URL matching - only use screenshots that actually exist
  if (jobUrl.includes('apply.appcast.io') || jobUrl.includes('healthcare') || jobUrl.includes('applyboard')) {
    jobType = 'appcast'
    actualScreenshots = [
      'job_job_1_application.png',
      'job_job_1_filled_form.png',
      'job_job_1_after_submission.png',
      'job_job_1_debug_filled.png'
    ]
  } else if (jobUrl.includes('smartrecruiters.com') || jobUrl.includes('retail') || jobUrl.includes('hollister') || jobUrl.includes('abercrombie')) {
    jobType = 'smartrecruiters'
    actualScreenshots = [
      'job_job_2_application.png',
      'job_job_2_debug_filled.png',
      'job_job_2_filled_form.png',
      'job_job_2_after_submission.png'
    ]
  } else {
    jobType = 'generic'
    actualScreenshots = [
      'job_job_1_application.png',
      'job_job_1_filled_form.png',
      'job_job_2_application.png',
      'job_job_2_filled_form.png'
    ]
  }
  
  // Cycle through appropriate screenshots
  const index = (actionCount - 1) % actualScreenshots.length
  const selectedScreenshot = actualScreenshots[index]
  
  console.log(`📸 Screenshot selection for ${jobType.toUpperCase()} job (${jobUrl}):`)
  console.log(`   Available screenshots: ${actualScreenshots.join(', ')}`)
  console.log(`   Selected: ${selectedScreenshot} (index ${index})`)
  
  return selectedScreenshot
}

const PORT = process.env.PORT || 8081
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
  console.log(`Monitoring UI should connect to: http://localhost:${PORT}`)
})
