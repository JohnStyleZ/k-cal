const apiBase = 'https://admin-dashboard-e2ja.onrender.com';
let sessionStartTime = null;
let currentUser = { device_id: null, name: null, gender: null, participant_id: null, email: null };

// Variables for calendar and panel state
let calendarDate = new Date();
let currentPanel = null;
let isPanelAnimating = false;

// Set panel height based on viewport height
function setPanelHeight() {
  const vh = window.innerHeight * 0.75;
  document.getElementById('bottomPanel').style.height = `${vh}px`;
}

// Format time helper function
function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const formatted = `${(hours % 12 || 12)}:${String(minutes).padStart(2, '0')} ${suffix}`;
  return formatted;
}

// Initialize device user
async function initializeDeviceUser() {
  const deviceId = localStorage.getItem('device_id');
  if (deviceId) {
    try {
      const res = await fetch(`${apiBase}/api/device-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId })
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = { 
          device_id: deviceId, 
          name: data.name, 
          gender: data.gender, 
          participant_id: data.participant_id,
          email: data.email
        };
        return;
      }
    } catch (err) {
      console.error('Device check failed:', err);
    }
  }
  showInitialUserModal();
}

// Show the initial user modal with login/register options
function showInitialUserModal() {
  const modal = document.getElementById('userModal');
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="box">
      <div class="auth-tabs">
        <div class="tab active" id="loginTab" onclick="switchTab('login')">Login</div>
        <div class="tab" id="registerTab" onclick="switchTab('register')">Register</div>
      </div>
      
      <!-- Login Form -->
      <div id="loginForm" class="auth-form">
        <label for="loginEmail">Email:</label>
        <input type="email" id="loginEmail" class="modal-input" placeholder="your@email.com" />
        
        <label for="loginPassword">Password:</label>
        <input type="password" id="loginPassword" class="modal-input" />
        
        <p style="text-align: right; margin: 5px 0;">
          <a href="#" onclick="showForgotPasswordForm()">Forgot password?</a>
        </p>
        
        <button onclick="handleLogin()" class="full-width-button">Login</button>
      </div>
      
      <!-- Register Form -->
      <div id="registerForm" class="auth-form" style="display: none;">
        <label for="registerEmail">Email:</label>
        <input type="email" id="registerEmail" class="modal-input" placeholder="your@email.com" />
        
        <label for="registerPassword">Password:</label>
        <input type="password" id="registerPassword" class="modal-input" placeholder="Min. 6 characters" />
        
        <label for="registerName">Name:</label>
        <input type="text" id="registerName" class="modal-input" />
        
        <label>Gender:</label><br/>
        <label><input type="radio" name="registerGender" value="Male" /> Male</label><br/>
        <label><input type="radio" name="registerGender" value="Female" /> Female</label><br/>
        
        <label for="securityQuestion">Security Question:</label>
        <select id="securityQuestion" class="modal-input">
          <option value="">Select a security question</option>
          <option value="pet">What was your first pet's name?</option>
          <option value="street">What street did you grow up on?</option>
          <option value="mother">What is your mother's maiden name?</option>
          <option value="school">What elementary school did you attend?</option>
          <option value="birth">In what city were you born?</option>
        </select>
        
        <label for="securityAnswer">Your Answer:</label>
        <input type="text" id="securityAnswer" class="modal-input" />
        <div class="info-text">Remember this answer! You'll need it to recover your account if you forget your password.</div>
        
        <button onclick="handleRegister()" class="full-width-button">Register</button>
      </div>
    </div>
  `;
  
  // Add CSS styles for the modal components
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .auth-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--border-light, #eee);
      }
      
      .tab {
        flex: 1;
        text-align: center;
        padding: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 3px solid transparent;
      }
      
      .tab.active {
        border-bottom: 3px solid var(--primary, #8956ff);
        color: var(--primary, #8956ff);
        font-weight: 600;
      }
      
      .full-width-button {
        width: 100%;
        padding: 12px;
        background: var(--primary, #8956ff);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        margin-top: 20px;
        cursor: pointer;
      }
      
      .info-text {
        font-size: 12px;
        color: #666;
        margin-top: -10px;
        margin-bottom: 15px;
      }
      
      .auth-form {
        transition: all 0.3s ease;
      }
      
      .security-question-box {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 6px;
        margin: 10px 0 20px;
        font-weight: 600;
        color: var(--text-primary, #4a2e91);
      }
      
      .button-container {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }
      
      .secondary-button {
        padding: 10px 15px;
        background: #eeeeee;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      
      .primary-button {
        padding: 10px 20px;
        background: var(--primary, #8956ff);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
    </style>
  `);
}

// Switch between login and register tabs
function switchTab(tab) {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}

// Handle user login
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }
  
  try {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (res.ok) {
      const userData = await res.json();
      
      // Save device ID in localStorage
      localStorage.setItem('device_id', userData.device_id);
      
      // Set current user
      currentUser = {
        device_id: userData.device_id,
        name: userData.name,
        gender: userData.gender,
        participant_id: userData.participant_id,
        email: userData.email
      };
      
      // Close the modal and continue to the app
    document.getElementById('userModal').style.display = 'none';
      
      // Load app data
      loadLocations();
    } else {
      alert('Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Login failed. Please try again.');
  }
}

// Handle user registration
async function handleRegister() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const name = document.getElementById('registerName').value.trim();
  const gender = document.querySelector('input[name="registerGender"]:checked')?.value;
  const securityQuestion = document.getElementById('securityQuestion').value;
  const securityAnswer = document.getElementById('securityAnswer').value.trim();
  
  if (!email || !password || !name || !gender || !securityQuestion || !securityAnswer) {
    alert('Please fill all fields');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  if (securityAnswer.length < 2) {
    alert('Please provide a valid answer to your security question');
    return;
  }
  
  try {
    // Generate a temporary device ID
    const tempId = `temp_${Date.now()}`;
    
    const res = await fetch(`${apiBase}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        gender,
        security_question: securityQuestion,
        security_answer: securityAnswer,
        device_id: tempId
      })
    });

    if (res.ok) {
      const userData = await res.json();
      
      // Save the device ID to localStorage
      localStorage.setItem('device_id', userData.device_id);
      
      // Set current user
      currentUser = {
        device_id: userData.device_id,
        name: userData.name,
        gender: userData.gender,
        participant_id: userData.participant_id,
        email: userData.email
      };
      
      // Close the modal and continue to the app
      document.getElementById('userModal').style.display = 'none';
      
      // Load app data
      loadLocations();
    } else {
      const errorData = await res.json();
      alert(errorData.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    alert('Registration failed. Please try again.');
  }
}

// Show forgot password form (Step 1: Email Entry)
function showForgotPasswordForm() {
  const modal = document.getElementById('userModal');
  
  modal.innerHTML = `
    <div class="box">
      <h3>Reset Password</h3>
      <p>Enter your email to begin password recovery.</p>
      
      <label for="resetEmail">Email:</label>
      <input type="email" id="resetEmail" class="modal-input" placeholder="your@email.com" />
      
      <div class="button-container">
        <button onclick="showInitialUserModal()" class="secondary-button">Back</button>
        <button onclick="findSecurityQuestion()" class="primary-button">Continue</button>
      </div>
    </div>
  `;
}

// Find security question for the entered email (Between Step 1 and 2)
async function findSecurityQuestion() {
  const email = document.getElementById('resetEmail').value.trim();
  
  if (!email) {
    alert('Please enter your email address');
    return;
  }
  
  try {
    // Show loading state
    const continueButton = document.querySelector('.primary-button');
    continueButton.textContent = 'Loading...';
    continueButton.disabled = true;
    
    const res = await fetch(`${apiBase}/api/auth/get-security-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    // Reset button state
    continueButton.textContent = 'Continue';
    continueButton.disabled = false;
    
    if (res.ok) {
      const { questionId, questionText } = await res.json();
      showSecurityAnswerForm(email, questionId, questionText);
    } else {
      // For security, don't reveal if the email exists or not
      alert('If this email is registered, you will see your security question.');
    }
  } catch (err) {
    console.error('Error fetching security question:', err);
    alert('Error fetching security question. Please try again.');
  }
}

// Show the security answer form (Step 2: Security Question)
function showSecurityAnswerForm(email, questionId, questionText) {
  const modal = document.getElementById('userModal');
  
  modal.innerHTML = `
    <div class="box">
      <h3>Security Verification</h3>
      <p>Please answer your security question:</p>
      
      <div class="security-question-box">
        ${questionText}
      </div>
      
      <label for="securityAnswer">Your Answer:</label>
      <input type="text" id="securityAnswer" class="modal-input" placeholder="Enter your answer" />
      
      <div class="button-container">
        <button onclick="showForgotPasswordForm()" class="secondary-button">Back</button>
        <button onclick="verifySecurityAnswer('${email}', '${questionId}')" class="primary-button">Verify</button>
      </div>
    </div>
  `;
}

// Verify the security answer (Between Step 2 and 3)
async function verifySecurityAnswer(email, questionId) {
  const answer = document.getElementById('securityAnswer').value.trim();
  
  if (!answer) {
    alert('Please enter your answer');
    return;
  }
  
  try {
    // Show loading state
    const verifyButton = document.querySelector('.primary-button');
    verifyButton.textContent = 'Verifying...';
    verifyButton.disabled = true;
    
    const res = await fetch(`${apiBase}/api/auth/verify-security-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        question_id: questionId,
        answer
      })
    });
    
    // Reset button state
    verifyButton.textContent = 'Verify';
    verifyButton.disabled = false;
    
    if (res.ok) {
      const { resetToken } = await res.json();
      showResetPasswordForm(resetToken);
    } else {
      alert('Incorrect answer. Please try again.');
    }
  } catch (err) {
    console.error('Error verifying answer:', err);
    alert('Error verifying answer. Please try again.');
  }
}

// Show reset password form (Step 3: New Password)
function showResetPasswordForm(resetToken) {
  const modal = document.getElementById('userModal');
  
  modal.innerHTML = `
    <div class="box">
      <h3>Set New Password</h3>
      <p>Create a new password for your account.</p>
      
      <label for="newPassword">New Password:</label>
      <input type="password" id="newPassword" class="modal-input" placeholder="Min. 6 characters" />
      
      <label for="confirmPassword">Confirm Password:</label>
      <input type="password" id="confirmPassword" class="modal-input" placeholder="Re-enter password" />
      
      <button onclick="resetPassword('${resetToken}')" class="full-width-button">Update Password</button>
    </div>
  `;
}

// Reset the password (Final step)
async function resetPassword(resetToken) {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!newPassword || newPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  try {
    // Show loading state
    const updateButton = document.querySelector('.full-width-button');
    updateButton.textContent = 'Updating...';
    updateButton.disabled = true;
    
    const res = await fetch(`${apiBase}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: newPassword
      })
    });
    
    if (res.ok) {
      alert('Password has been successfully reset. You can now log in with your new password.');
      showInitialUserModal();
    } else {
      updateButton.textContent = 'Update Password';
      updateButton.disabled = false;
      alert('Failed to reset password. Please try again.');
    }
  } catch (err) {
    console.error('Password reset error:', err);
    alert('Failed to reset password. Please try again.');
  }
}

// Check and resume session from DB
async function checkAndResumeSessionFromDB() {
  const res = await fetch(`${apiBase}/api/participant-sessions/${currentUser.participant_id}`);
  const sessions = await res.json();

  const activeSession = sessions.find(s => !s.leave_time);
  if (!activeSession) return false;

  const sessionId = activeSession.session_id;

  const sessionRes = await fetch(`${apiBase}/api/sessions`);
  const allSessions = await sessionRes.json();
  const fullSession = allSessions.find(s => s.session_id == sessionId);
  if (!fullSession) return false;

  const locRes = await fetch(`${apiBase}/api/locations`);
  const locations = await locRes.json();
  const locationName = locations.find(l => l.location_id == fullSession.location_id)?.name || 'Unknown';

  // Get actual participant count from active session list
  const countRes = await fetch(`${apiBase}/api/sessions/active?location_id=${fullSession.location_id}`);
  const sessionList = await countRes.json();
  const match = sessionList.find(s => s.session_id == sessionId);
  const participant_count = match?.participant_count || 1;

  showSessionInfo({
    session_id: sessionId,
    start_time: fullSession.start_time,
    location: locationName,
    participant_count,
    user_join_time: activeSession.join_time,
    started_by_current_user: fullSession.started_by == currentUser.participant_id
  });
  
  return true;
}

// Load locations
async function loadLocations() {
  try {
    const res = await fetch(`${apiBase}/api/locations`);
    if (res.ok) {
      const locations = await res.json();
      const dropdown = document.getElementById('locationDropdown');
      dropdown.innerHTML = '';
      
      locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.location_id;
        option.textContent = loc.name;
        dropdown.appendChild(option);
      });
      
      loadActiveSessions();
    }
  } catch (err) {
    console.error('Load locations failed:', err);
    alert('Failed to load locations');
  }
}

// Load active sessions
async function loadActiveSessions() {
  const locationId = document.getElementById('locationDropdown').value;
  if (!locationId) return;
  
  try {
    const res = await fetch(`${apiBase}/api/sessions/active?location_id=${locationId}`);
    if (res.ok) {
      const sessions = await res.json();
      const container = document.getElementById('activeSessionsList');
      const startBtn = document.getElementById('startSessionBtn');
      
      // Show the start session button by default
      if (startBtn) {
        startBtn.style.display = 'flex';
        startBtn.classList.remove('fade-out');
      }
      
      // Clear the container and reset styles before adding new content
      container.innerHTML = '';
      container.style.paddingTop = '10px';
      
      if (sessions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No active sessions</p>';
        return;
      }
      
      // Fetch all session details to get starter names
      const allSessionsRes = await fetch(`${apiBase}/api/sessions`);
      const allSessions = await allSessionsRes.json();
      
      // Fetch all participants to get names
      const participantsRes = await fetch(`${apiBase}/api/participants`);
      const allParticipants = await participantsRes.json();
      
      // Create a document fragment to improve performance
      const fragment = document.createDocumentFragment();
      
      sessions.forEach(async session => {
        // Get room number from session data or use session ID as fallback
        const fullSession = allSessions.find(s => s.session_id == session.session_id);
        const roomNumber = fullSession?.room_number || session.session_id;
        
        // Find the full session info to get starter ID
        const starterId = fullSession?.started_by;
        
        // Find starter name
        const starter = allParticipants.find(p => p.participant_id == starterId);
        const starterName = starter?.name || 'Unknown';
        
        const startTime = new Date(session.start_time);
        const formattedTime = formatTime(startTime);
        
        const card = document.createElement('div');
        card.className = 'session-card';
        card.innerHTML = `
          <div class="session-card-header">
          <h4>Session #${session.session_id}</h4>
            <span class="room-badge"><i class="fas fa-door-open"></i> Room ${roomNumber}</span>
          </div>
          <div class="session-info-grid">
            <div><i class="fas fa-map-marker-alt"></i> ${session.location_name}</div>
            <div><i class="fas fa-user"></i> ${starterName}</div>
            <div><i class="fas fa-clock"></i> ${formattedTime}</div>
            <div><i class="fas fa-users"></i> ${session.participant_count} participants</div>
          </div>
          <button onclick="joinSession(${session.session_id})">Join</button>
        `;
        fragment.appendChild(card);
      });
      
      // Append all cards at once
      container.appendChild(fragment);
      
      // Add extra bottom margin to the last card
      if (container.children.length > 0) {
        const lastCard = container.children[container.children.length - 1];
        lastCard.style.marginBottom = '60px';
      }
    }
  } catch (err) {
    console.error('Load active sessions failed:', err);
    document.getElementById('activeSessionsList').innerHTML = 
      '<p style="text-align: center; color: #888;">Failed to load sessions</p>';
    
    // Ensure start button is visible on error
    const startBtn = document.getElementById('startSessionBtn');
    if (startBtn) {
      startBtn.style.display = 'flex';
      startBtn.classList.remove('fade-out');
    }
  }
}

// Start new session
function startNewSession() {
  // Populate the location dropdown in the modal
  const mainLocationDropdown = document.getElementById('locationDropdown');
  const modalLocationSelect = document.getElementById('modalLocationSelect');
  
  // Clear previous options
  modalLocationSelect.innerHTML = '';
  
  // Copy options from the main dropdown
  Array.from(mainLocationDropdown.options).forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.textContent;
    modalLocationSelect.appendChild(option);
  });
  
  // If a location is already selected in the main dropdown, select it in the modal too
  if (mainLocationDropdown.value) {
    modalLocationSelect.value = mainLocationDropdown.value;
  }
  
  // Clear previous room number
  document.getElementById('modalRoomNumber').value = '';
  
  // Show the modal
  document.getElementById('startSessionModal').style.display = 'flex';
}

// Confirm start session from modal
async function confirmStartSession() {
  const locationId = document.getElementById('modalLocationSelect').value;
  const roomNumber = document.getElementById('modalRoomNumber').value.trim();
  
  if (!locationId) {
    alert("Please select a location.");
    return;
  }
  
  if (!roomNumber) {
    alert("Please enter a room number.");
    return;
  }
  
  // Hide the modal
  document.getElementById('startSessionModal').style.display = 'none';
  
  // Get location name
  const locationName = document.querySelector(`#modalLocationSelect option[value="${locationId}"]`)?.textContent;

  const startTime = new Date().toISOString();

  try {
  const res = await fetch(`${apiBase}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start_time: startTime,
      participant_id: currentUser.participant_id,
        location_id: locationId,
        room_number: roomNumber
    })
  });

  const data = await res.json();

  if (res.ok && data.session_id) {
    const sessionId = data.session_id;

    const joinTime = new Date().toISOString();
    await fetch(`${apiBase}/api/participant-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: currentUser.participant_id,
        session_id: sessionId,
        join_time: joinTime,
        leave_time: null
      })
    });

    alert(`Session started! Session ID: ${sessionId}`);
      
      // Update the main dropdown to reflect the selected location
      document.getElementById('locationDropdown').value = locationId;
    await loadActiveSessions();

    // Fetch participant count after join
    const countRes = await fetch(`${apiBase}/api/sessions/active?location_id=${locationId}`);
    const sessionList = await countRes.json();
    const match = sessionList.find(s => s.session_id == sessionId);
    const participant_count = match?.participant_count || 1;

    showSessionInfo({
      session_id: sessionId,
      start_time: startTime,
        location: locationName,
      participant_count,
      user_join_time: joinTime,
      started_by_current_user: true
    });
  } else {
    alert("Failed to start session.");
    }
  } catch (err) {
    console.error("Error starting session:", err);
    alert("Error starting session. Please try again.");
  }
}

// Join existing session
async function joinSession(sessionId) {
  const joinTime = new Date().toISOString();

  try {
    await fetch(`${apiBase}/api/participant-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: currentUser.participant_id,
        session_id: sessionId,
        join_time: joinTime,
        leave_time: null
      })
    });

    const sessionRes = await fetch(`${apiBase}/api/sessions`);
    const allSessions = await sessionRes.json();
    const fullSession = allSessions.find(s => s.session_id == sessionId);

    const locRes = await fetch(`${apiBase}/api/locations`);
    const locations = await locRes.json();
    const locationName = locations.find(l => l.location_id == fullSession.location_id)?.name || 'Unknown';

    showSessionInfo({
      session_id: sessionId,
      start_time: fullSession.start_time,
      location: locationName,
      participant_count: 1,
      user_join_time: joinTime,
      started_by_current_user: fullSession.started_by == currentUser.participant_id
    });
  } catch (err) {
    console.error('Error joining session:', err);
    alert('Failed to join session');
  }
}

// Load session participants
async function loadParticipants(sessionId) {
  try {
    const res = await fetch(`${apiBase}/api/sessions/${sessionId}/participants`);
    if (res.ok) {
      const data = await res.json();
      
      const participants = data.participants || [];
      document.getElementById('infoParticipants').textContent = participants.length;
      
      const panelContent = document.getElementById('panelContent');
      panelContent.innerHTML = '';
      
      participants.forEach(participant => {
        const joinTime = new Date(participant.join_time);
        const row = document.createElement('div');
        row.className = 'participant-row';
        row.innerHTML = `
          <div class="name">${participant.name}</div>
          <div class="time">${formatTime(joinTime)}</div>
          <div class="minutes">0 min</div>
        `;
        panelContent.appendChild(row);
      });
      
      togglePanel('participants');
    }
  } catch (err) {
    console.error('Load participants failed:', err);
  }
}

// Start polling for participants
let participantPollingInterval = null;

function startParticipantPolling(sessionId) {
  clearInterval(participantPollingInterval);
  participantPollingInterval = setInterval(() => loadParticipants(sessionId), 10000);
}

// Leave session
async function leaveSession() {
  const sessionId = document.getElementById('infoSessionId').textContent;
  if (!sessionId || !currentUser.participant_id) return;

  const leaveTime = new Date().toISOString();

  try {
    await fetch(`${apiBase}/api/participant-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: currentUser.participant_id,
        session_id: sessionId,
        leave_time: leaveTime
      })
    });

    alert("You have left the session.");
    document.getElementById('sessionInfoBlock').style.display = 'none';
    document.getElementById('startSessionBtn').style.display = 'flex';
    document.querySelector('.container').style.display = 'block';
    await loadActiveSessions();
  } catch (err) {
    console.error("Failed to leave session:", err);
    alert("Error while leaving session.");
  }
}

// End session
async function endSession() {
  const sessionId = document.getElementById('infoSessionId').textContent;
  if (!sessionId) return;

  const endTime = new Date().toISOString();

  try {
    const res = await fetch(`${apiBase}/api/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ end_time: endTime })
    });

    if (res.ok) {
      alert("Session ended!");
      document.getElementById('sessionInfoBlock').style.display = 'none';
      document.getElementById('startSessionBtn').style.display = 'flex';
      document.querySelector('.container').style.display = 'block';
      await loadActiveSessions();
    } else {
      alert("Failed to end session.");
    }
  } catch (err) {
    console.error("Error ending session:", err);
    alert("Error while ending session.");
  }
}

// Toggle panel
function togglePanel(type) {
  const panel = document.getElementById('bottomPanel');
  const header = document.getElementById('panelHeader');
  const content = document.getElementById('panelContent');
  const indicator = document.getElementById('indicator');
  const menuItems = document.querySelectorAll('.navigation .list');
  const index = type === 'participants' ? 0 :
               type === 'calculator' ? 1 :
               type === 'history' ? 2 :
               type === 'profile' ? 3 : 0;

  indicator.style.left = `${index * 25}%`;
  menuItems.forEach(item => item.classList.remove('active'));
  menuItems[index].classList.add('active');

  if (currentPanel === type) {
    closePanel();
    return;
  }

  if (panel.classList.contains('open')) {
    isPanelAnimating = true;
    panel.classList.remove('open');
    setTimeout(() => {
      showPanel(type);
      panel.classList.add('open');
      isPanelAnimating = false;
    }, 300);
  } else {
    showPanel(type);
    panel.classList.add('open');
  }
}

// Close panel
function closePanel() {
  const panel = document.getElementById('bottomPanel');
  panel.classList.remove('open');
  currentPanel = null;
}

// Show panel content
function showPanel(type) {
  currentPanel = type;
  const header = document.getElementById('panelHeader');
  const content = document.getElementById('panelContent');
  
  if (type === 'participants') {
    header.textContent = 'Active Participants';

    const sessionId = document.getElementById('infoSessionId')?.textContent;
    if (!sessionId) {
      content.innerHTML = '<p style="text-align:center; margin-top:20px;">No active session.</p>';
      return;
    }

    fetch(`${apiBase}/api/sessions/${sessionId}/participants`)
      .then(res => res.json())
      .then(users => {
        if (users.length === 0) {
          content.innerHTML = '<p style="text-align:center; margin-top:20px;">No participants currently in session.</p>';
          return;
        }

        content.innerHTML = users.map(user => {
          const joinTime = new Date(user.join_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `
            <div style="
              background: #f9f9ff;
              border-left: 4px solid ${user.name === currentUser.name ? '#28a745' : '#7b4dd6'};
              border-radius: 6px;
              padding: 10px 15px;
              margin-bottom: 10px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            ">
              <div style="font-weight:600; font-size: 15px;">
                ${user.name} ${user.name === currentUser.name ? '<span style="color:green;">(You)</span>' : ''}
              </div>
              <div style="font-size: 13px; color: #555; display: flex; justify-content: space-between;">
                <span>Gender: ${user.gender || 'N/A'}</span>
                <span>Joined: ${joinTime}</span>
              </div>
            </div>
          `;
        }).join('');
      })
      .catch(err => {
        console.error(err);
        content.innerHTML = '<p style="text-align:center; color:red;">Error loading participants.</p>';
      });
  } else if (type === 'calculator') {
    header.textContent = 'Cost Calculator';
    // Disable confirm button if not host
    const isHost = document.getElementById('endSessionBtn')?.style.display === 'inline-block';
    
    content.innerHTML = `
      <div id="sessionDetails" style="margin-bottom: 20px; font-size: 15px;"></div>

      <div class="input-group">
        <label for="calcPaid">Total Paid ($):</label>
        <input type="number" id="calcPaid" step="0.01" min="0" max="999.99" placeholder="0.00" class="modal-input" />
        <button onclick="confirmCostData()">Confirm</button>
      </div>

      <div id="participantCostList" style="margin-bottom: 20px;"></div>

      <button onclick="calculateFinalCosts()" style="width: 100%; padding: 12px; background: var(--primary); color: white; font-size: 16px; border: none; border-radius: 8px; font-weight: 600;">
        🧮 Calculate Cost Breakdown
      </button>

      <div id="calcResult" style="margin-top: 20px; font-size: 15px; line-height: 1.5;"></div>
    `;

    loadSessionAndParticipantsForCalc();
  } else if (type === 'history') {
    header.style.display = 'none';
    header.textContent = 'History';
    content.innerHTML = `
      <div id="calendarStickyHeader">
        <div style="text-align:center; margin-bottom:10px;">
          <button onclick="changeMonth(-1)">←</button>
          <span id="calendarMonthLabel" style="margin: 0 10px; font-weight: bold;"></span>
          <button onclick="changeMonth(1)">→</button>
        </div>
        <div id="calendarHeader" style="display:grid; grid-template-columns:repeat(7,1fr); font-weight:bold; text-align:center; margin-bottom:5px;">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div id="calendar" style="display:grid; grid-template-columns:repeat(7,1fr); gap:6px; text-align:center;"></div>
      </div>

      <div id="sessionListThisMonth" style="margin-top: 10px;"></div>
      <div id="dayDetails" style="margin-top:15px; text-align:center;"></div>
    `;

    generateCalendar();
  } else if (type === 'profile') {
    header.textContent = '';
    fetch(`${apiBase}/api/participant-sessions/${currentUser.participant_id}`)
      .then(res => res.json())
      .then(sessions => {
        const totalSpent = sessions.reduce((sum, s) => sum + (parseFloat(s.adjusted_cost) || 0), 0);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const thisMonthSpent = sessions.filter(s => s.join_time?.startsWith(currentMonth))
                                     .reduce((sum, s) => sum + (parseFloat(s.adjusted_cost) || 0), 0);
        const sessionCount = sessions.length;
        content.innerHTML = `
          <div style="background: radial-gradient(circle at center, #7b4dd6 0%, #453174 100%); padding: 30px 20px 20px; border-radius: 20px; text-align: center; color: white; position: relative;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 0 10px; margin-bottom: 10px;">
              <div><i class="fas fa-id-badge"></i> ID#${currentUser.participant_id}</div>
              <div><i class="fas fa-venus-mars"></i> ${currentUser.gender}</div>
            </div>

            <img src="https://johnwusf.com/wechat_doghead.png" alt="Profile Picture" 
              style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid white; object-fit: cover; margin-bottom: 10px;" />
            
            <h2 style="margin: 8px 0 2px;">${currentUser.name}</h2>
          </div>

          <div style="padding: 20px; background: #fff; border-radius: 0 0 20px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 10px; border-bottom: 1px solid #eee;">
              <div><i class="fas fa-dollar-sign" style="margin-right: 8px; color: #7b4dd6;"></i>Total Spent</div>
              <div>$${totalSpent.toFixed(2)} <i class="fas fa-chevron-right" style="font-size: 12px; color: #ccc;"></i></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 10px; border-bottom: 1px solid #eee;">
              <div><i class="fas fa-calendar-alt" style="margin-right: 8px; color: #7b4dd6;"></i>This Month</div>
              <div>$${thisMonthSpent.toFixed(2)} <i class="fas fa-chevron-right" style="font-size: 12px; color: #ccc;"></i></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 10px;">
              <div><i class="fas fa-music" style="margin-right: 8px; color: #7b4dd6;"></i>Sessions Attended</div>
              <div>${sessionCount} <i class="fas fa-chevron-right" style="font-size: 12px; color: #ccc;"></i></div>
            </div>
          </div>
        `;
      })
      .catch(err => {
        content.innerHTML = '<p>Error loading profile data.</p>';
        console.error(err);
      });
  }
}

// Load session history
async function loadSessionHistory() {
  const panelContent = document.getElementById('panelContent');
  panelContent.innerHTML = '<p style="text-align:center;">Loading history...</p>';
  
  try {
    const res = await fetch(`${apiBase}/api/session-history/${currentUser.device_id}`);
    if (res.ok) {
      const sessions = await res.json();
      
      if (sessions.length === 0) {
        panelContent.innerHTML = '<p style="text-align:center;">No session history</p>';
        return;
      }
      
      panelContent.innerHTML = `
        <div id="calendarStickyHeader">
          <h3 style="margin:0 0 10px 0;">Your Session History</h3>
        </div>
        <div id="sessionsList"></div>
      `;
      
      const sessionsList = document.getElementById('sessionsList');
      sessions.forEach(session => {
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        const durationMs = endTime - startTime;
        const durationMin = Math.round(durationMs / 60000);
        const cost = (durationMin * 0.25).toFixed(2);
        
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-info-card';
        sessionCard.innerHTML = `
          <div class="session-main">
            <div class="session-details">
              <div class="session-title">${session.location_name}</div>
              <div class="session-time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
              <div class="session-date">${startTime.toLocaleDateString()}</div>
            </div>
            <div class="session-cost">$${cost}</div>
          </div>
        `;
        sessionsList.appendChild(sessionCard);
      });
    }
  } catch (err) {
    console.error('Load history failed:', err);
    panelContent.innerHTML = '<p style="text-align:center;">Failed to load history</p>';
  }
}

// Update calculator
function updateCalculator() {
  if (!sessionStartTime) return;
  
  const now = new Date();
  const durationMs = now - sessionStartTime;
  const durationMin = Math.round(durationMs / 60000);
  
  const participantCount = parseInt(document.getElementById('infoParticipants').textContent) || 0;
  const costPerMinute = 0.25;
  const totalCost = (durationMin * participantCount * costPerMinute).toFixed(2);
  
  document.getElementById('sessionDuration').textContent = durationMin;
  document.getElementById('participantCount').textContent = participantCount;
  document.getElementById('costEstimate').textContent = totalCost;
}

// Show session info
function showSessionInfo(session) {
  document.querySelector('.container').style.display = 'none';
  document.getElementById('startSessionBtn').style.display = 'none';
  const block = document.getElementById('sessionInfoBlock');
  
  document.getElementById('infoLocation').textContent = session.location || 'N/A';
  document.getElementById('infoSessionId').textContent = session.session_id;
  document.getElementById('infoStartTime').textContent = new Date(session.start_time).toLocaleString();
  document.getElementById('infoJoinTime').textContent = new Date(session.user_join_time).toLocaleString();
  document.getElementById('infoParticipants').textContent = session.participant_count;

  // Get room number and starter name
  const getSessionDetails = async () => {
    try {
      // Get all sessions to find out session details
      const sessionRes = await fetch(`${apiBase}/api/sessions`);
      const allSessions = await sessionRes.json();
      const fullSession = allSessions.find(s => s.session_id == session.session_id);
      const roomNumber = fullSession?.room_number || session.session_id;
      const starterId = fullSession?.started_by;
      
      // Set room number
      document.getElementById('infoRoom').textContent = roomNumber;
      
      // Get starter name
      const participantsRes = await fetch(`${apiBase}/api/participants`);
      const allParticipants = await participantsRes.json();
      const starter = allParticipants.find(p => p.participant_id == starterId);
      const starterName = starter?.name || 'Unknown';
      
      document.getElementById('infoStarter').textContent = starterName;
    } catch (err) {
      console.error('Error getting session details:', err);
      document.getElementById('infoRoom').textContent = session.session_id;
      document.getElementById('infoStarter').textContent = 'Unknown';
    }
  };
  
  getSessionDetails();

  if (session.started_by_current_user) {
    document.getElementById('endSessionBtn').style.display = 'inline-block';
  } else {
    document.getElementById('endSessionBtn').style.display = 'none';
  }

  block.style.display = 'block';
}

// Add a function to make the start button fade out when scrolling to the bottom
function setupScrollHandler() {
  const activeSessionsList = document.querySelector('.active-sessions-list');
  const startBtn = document.getElementById('startSessionBtn');
  if (!activeSessionsList || !startBtn) return;
  
  let lastScrollTop = 0;
  let scrollingDown = false;
  let scrollTimeout;
  let spacerAdded = false;
  
  // First check if there's enough content to justify hiding the button
  function checkButtonVisibility() {
    // Show button by default if there are few or no items
    const itemCount = activeSessionsList.children.length;
    const containerHeight = activeSessionsList.clientHeight;
    const contentHeight = activeSessionsList.scrollHeight;
    
    // If content is shorter than container or very few items, always show button
    if (contentHeight <= containerHeight || itemCount <= 2) {
      startBtn.classList.remove('fade-out');
      
      // Remove spacer if it was added and no longer needed
      if (spacerAdded) {
        const spacer = activeSessionsList.querySelector('.scroll-spacer');
        if (spacer) {
          activeSessionsList.removeChild(spacer);
          spacerAdded = false;
        }
      }
      
      return false;
    }
    
    // Add spacer if not already added
    if (!spacerAdded) {
      const containerDiv = document.createElement('div');
      containerDiv.className = 'scroll-spacer';
      containerDiv.style.height = '80px'; // For better scrolling experience
      activeSessionsList.appendChild(containerDiv);
      spacerAdded = true;
    }
    
    return true;
  }
  
  // Function to handle scroll events (works for both touch and mouse)
  function handleScroll() {
    // First check if we should even handle scrolling based on content amount
    if (!checkButtonVisibility()) return;
    
    const scrollTop = activeSessionsList.scrollTop;
    
    // Determine scroll direction
    scrollingDown = scrollTop > lastScrollTop;
    lastScrollTop = scrollTop;
    
    // Calculate when we're nearing the bottom of the list
    // Use a larger threshold for mobile devices
    const isNearBottom = scrollTop + activeSessionsList.clientHeight >= activeSessionsList.scrollHeight - 180;
    
    // Handle button visibility based on scroll direction and position
    if (scrollingDown && isNearBottom) {
      startBtn.classList.add('fade-out');
    } else if (!isNearBottom || !scrollingDown) {
      startBtn.classList.remove('fade-out');
    }
    
    // Clear previous timeout
    clearTimeout(scrollTimeout);
    
    // Add a timeout to show the button again after scrolling stops
    scrollTimeout = setTimeout(() => {
      // When scrolling stops, show button if not near bottom
      if (!isNearBottom) {
        startBtn.classList.remove('fade-out');
      }
    }, 300);
  }
  
  // Function to explicitly show button - helps on mobile
  function showButton() {
    if (checkButtonVisibility()) {
      const scrollTop = activeSessionsList.scrollTop;
      const isNearBottom = scrollTop + activeSessionsList.clientHeight >= activeSessionsList.scrollHeight - 180;
      
      if (!isNearBottom) {
        startBtn.classList.remove('fade-out');
      }
    }
  }
  
  // Add scroll event listener (works for both desktop and mobile)
  activeSessionsList.addEventListener('scroll', handleScroll, { passive: true });
  
  // Also handle touch events specifically for mobile
  activeSessionsList.addEventListener('touchstart', showButton, { passive: true });
  activeSessionsList.addEventListener('touchmove', handleScroll, { passive: true });
  activeSessionsList.addEventListener('touchend', function() {
    // After touch ends, check one more time with a delay
    setTimeout(handleScroll, 100);
  }, { passive: true });
  
  // Initial check
  checkButtonVisibility();
  
  // Also run check when sessions are loaded or changed
  const observer = new MutationObserver(() => {
    checkButtonVisibility();
  });
  observer.observe(activeSessionsList, { childList: true });
}

// Initialize the app
window.addEventListener('load', async () => {
  setPanelHeight();
  await initializeDeviceUser();
  await loadLocations(); // loadLocations already calls loadActiveSessions, no need to call twice
  
  // Check if user has active session and set UI elements accordingly
  const hasActiveSession = await checkAndResumeSessionFromDB();
  if (hasActiveSession) {
    document.getElementById('startSessionBtn').style.display = 'none';
  } else {
    document.getElementById('startSessionBtn').style.display = 'flex';
  }
  
  // Setup scroll handler
  setupScrollHandler();
});

window.addEventListener('resize', setPanelHeight);

// Set up calculator update interval
setInterval(updateCalculator, 60000); // Update every minute 

// Change month for calendar
function changeMonth(offset) {
  calendarDate.setMonth(calendarDate.getMonth() + offset);
  generateCalendar();
}

// Generate calendar
async function generateCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth(); // 0-based

  // Update label only (don't overwrite full structure)
  const label = document.getElementById('calendarMonthLabel');
  const cal = document.getElementById('calendar');
  const sessionListContainer = document.getElementById('sessionListThisMonth');

  label.textContent = calendarDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  cal.innerHTML = ''; // Clear calendar
  sessionListContainer.innerHTML = ''; // Clear session list

  // Fetch all sessions
  const res = await fetch(`${apiBase}/api/participant-sessions/${currentUser.participant_id}`);
  const data = await res.json();

  // Filter to current month
  const sessionsThisMonth = data.filter((s) => {
    const date = new Date(s.join_time);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  // Display session list for the month
  if (sessionsThisMonth.length) {
    sessionListContainer.innerHTML = `
      <h4 style="margin: 15px 0 10px; font-size: 16px;">Sessions This Month (${sessionsThisMonth.length})</h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${sessionsThisMonth
          .map((s) => {
            const start = new Date(s.join_time);
            const end = s.leave_time ? new Date(s.leave_time) : null;
            return `
            <div class="session-info-card">
                <div class="session-main">
                <div class="session-details">
                    <div class="session-title">${s.location_name || 'Unknown'}</div>
                    <div class="session-time">
                    ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – 
                    ${end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </div>
                </div>
                <div class="session-meta">
                    <div class="session-date">
                    ${start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div class="session-cost">
                    $${parseFloat(s.adjusted_cost || 0).toFixed(2)}
                    </div>
                </div>
                </div>
            </div>
            `;
          })
          .join('')}
      </div>
    `;
  } else {
    sessionListContainer.innerHTML = `<p style="color:#888; font-size:14px; margin-top:10px;">No sessions this month.</p>`;
  }

  // Build calendar
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();

  const dayMap = {};
  data.forEach((s) => {
    const date = new Date(s.join_time);
    const key = date.toISOString().split('T')[0];
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push({
      cost: parseFloat(s.adjusted_cost || 0),
      start: new Date(s.join_time),
      end: new Date(s.leave_time),
    });
  });

  for (let i = 0; i < startDay; i++) {
    cal.appendChild(document.createElement('div')); // empty cell
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cell = document.createElement('div');
    cell.textContent = d;
    cell.style.padding = '8px';
    cell.style.borderRadius = '6px';
    cell.style.cursor = 'pointer';

    if (dayMap[dateKey]) {
      const sessions = dayMap[dateKey];
      const total = sessions.reduce((sum, s) => sum + s.cost, 0);
      cell.style.background = '#7b4dd6';
      cell.style.color = 'white';
      cell.style.fontWeight = 'bold';
      cell.title = `Total: $${total.toFixed(2)}\nTimes:\n${sessions
        .map(
          (s) =>
            `${s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${s.end.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`
        )
        .join('\n')}`;
    }

    cal.appendChild(cell);
  }
}

// Load session and participants for calculator
async function loadSessionAndParticipantsForCalc() {
  const detailBlock = document.getElementById('sessionDetails');
  const listBlock = document.getElementById('participantCostList');
  const sessionId = document.getElementById('infoSessionId')?.textContent;

  let session;
  try {
    if (sessionId) {
      const sessionRes = await fetch(`${apiBase}/api/sessions/${sessionId}`);
      session = (await sessionRes.json())[0];
    } else {
      const unpaidRes = await fetch(`${apiBase}/api/sessions/unpaid-host/${currentUser.participant_id}`);
      session = await unpaidRes.json();
    }
    if (!session) {
      detailBlock.innerHTML = 'No session found.';
      return;
    }
  } catch (err) {
    detailBlock.innerHTML = 'No unpaid session found.';
    console.error(err);
    return;
  }

  detailBlock.innerHTML = `
    <strong>Session #:</strong> ${session.session_id}<br>
    <strong>Location:</strong> ${session.location_name || 'N/A'}<br>
    <strong>Date:</strong> ${new Date(session.start_time).toLocaleDateString()}
  `;

  try {
    const res = await fetch(`${apiBase}/api/sessions/${session.session_id}/participants`);
    const participants = await res.json();

    if (!participants.length) {
      listBlock.innerHTML = 'No participants found.';
      return;
    }

    window._calcParticipants = participants.map(p => {
      return {
        id: p.participant_id,
        name: p.name,
        joinTime: new Date(p.join_time),
        leaveTime: p.leave_time ? new Date(p.leave_time) : null,
        adjusted_cost: 0
      };
    });

    // Start a dynamic updater
    function updateLiveTimes() {
      const now = new Date();
      const listBlock = document.getElementById('participantCostList');

      listBlock.innerHTML = window._calcParticipants.map(p => {
        const isLive = !p.leaveTime;
        const effectiveLeave = isLive ? now : p.leaveTime;
        const mins = Math.max(0, Math.floor((effectiveLeave - p.joinTime) / 60000));

        const joinStr = p.joinTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Los_Angeles'
        });

        const leaveStr = effectiveLeave.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Los_Angeles'
        });

        p.minutes = mins;

        return `
          <div class="participant-row">
            <div class="name">${p.name}</div>
            <div class="time">${joinStr} – ${leaveStr}${isLive ? ' <span style="color:green;">(now)</span>' : ''}</div>
            <div class="minutes">${mins} min</div>
          </div>
        `;
      }).join('');
    }

    // Update every second
    setInterval(() => {
      if (window._calcParticipants?.some(p => !p.leaveTime)) {
        updateLiveTimes();
      }
    }, 1000);

    updateLiveTimes(); // Run immediately once
  } catch (err) {
    listBlock.innerHTML = 'Error fetching participants.';
    console.error(err);
  }
}

// Calculate final costs
function calculateFinalCosts() {
  const totalPaid = parseFloat(document.getElementById('calcPaid').value);
  const resultBlock = document.getElementById('calcResult');

  if (isNaN(totalPaid) || totalPaid <= 0) {
    resultBlock.innerHTML = '<p>Please enter a valid total amount paid.</p>';
    return;
  }

  const participants = window._calcParticipants || [];
  const totalMinutes = participants.reduce((sum, p) => sum + p.minutes, 0);

  if (totalMinutes === 0) {
    resultBlock.innerHTML = '<p>No valid time data found.</p>';
    return;
  }

  const costPerMinute = totalPaid / totalMinutes;
  let html = '';
  let breakdownText = `Cost Breakdown:\n`;

  html += `<div style="background: #f9f9ff; padding: 10px; border-radius: 6px; margin-top: 10px;">`;

  participants.forEach(p => {
    const owed = costPerMinute * p.minutes;
    p.adjusted_cost = parseFloat(owed.toFixed(2));
    html += `
      <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
        <strong>${p.name}</strong>: ${p.minutes} min → <span style="color: #28a745;">$${owed.toFixed(2)}</span>
      </div>
    `;
    breakdownText += `${p.name}: ${p.minutes} min → $${owed.toFixed(2)}\n`;
  });

  html += `</div>`;
  resultBlock.innerHTML = html;

  // Copy to clipboard
  navigator.clipboard.writeText(breakdownText.trim()).then(() => {
    alert("Cost breakdown copied to clipboard.");
  }).catch(err => {
    console.error("Copy failed:", err);
    alert("Failed to copy to clipboard.");
  });
}

// Confirm cost data
async function confirmCostData() {
  calculateFinalCosts();

  const totalPaid = parseFloat(document.getElementById('calcPaid').value);
  if (isNaN(totalPaid) || totalPaid <= 0) {
    alert("Please enter a valid total amount.");
    return;
  }

  let sessionId = document.getElementById('infoSessionId')?.textContent;
  if (!sessionId) {
    const res = await fetch(`${apiBase}/api/sessions/unpaid-host/${currentUser.participant_id}`);
    if (!res.ok) {
      alert("Session not found.");
      return;
    }
    const session = await res.json();
    sessionId = session.session_id;
  }

  // Check if session has ended
  const sessionRes = await fetch(`${apiBase}/api/sessions/${sessionId}`);
  const sessionData = (await sessionRes.json())[0];
  if (!sessionData.end_time) {
    alert("Please end the session before confirming payment.");
    return;
  }

  // Confirm posting data
  const participants = window._calcParticipants || [];
  if (!participants.length) {
    alert("No participant cost data available.");
    return;
  }

  try {
    // 1. Update session total
    await fetch(`${apiBase}/api/sessions/${sessionId}/paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_actual_paid: totalPaid })
    });

    // 2. Update participant costs
    const costUpdates = participants.map(p => ({
      participant_id: p.id,
      adjusted_cost: p.adjusted_cost
    }));

    await fetch(`${apiBase}/api/sessions/${sessionId}/adjust-costs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ costs: costUpdates })
    });

    alert("Cost confirmed and saved!");
  } catch (err) {
    console.error("Error confirming data:", err);
    alert("Failed to confirm cost data.");
  }
} 