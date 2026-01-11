
import { connect } from "@/config/dbconfig";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Event from "@/models/Event";
import Participation from "@/models/Participation";

// --- Helper: Determine Limits based on College & Fee ---
function getPlanLimits(user) {
  // 1. Robust Input Handling
  // Convert fee to a Number explicitly to handle "249" (string) vs 249 (number)
  const fee = Number(user.registrationFee); 
  
  // Trim whitespace from college name to avoid mismatches like "KEC " vs "KEC"
  const collegeName = user.college ? user.college.trim() : "";
  const isKEC = collegeName === "Katihar Engineering College, Katihar"; 

  // Debugging Log: Check exactly what the code sees
  console.log(`[Debug] Checking Limits for Fee: ${fee} (Type: ${typeof fee}) | College: "${collegeName}" | isKEC: ${isKEC}`);

  // Default Limits (Fallback)
  let limits = { tech: 0, cult: 0, total: 99 };

  if (isKEC) {
    if (fee === 249) limits = { tech: 2, cult: 2, total: 99 };
    else if (fee === 329) limits = { tech: 4, cult: 3, total: 99 };
    else if (fee === 449) limits = { tech: 6, cult: 5, total: 99 };
  } else {
    // Other Colleges
    if (fee === 149) limits = { tech: 1, cult: 1, total: 1 }; // Special "1T OR 1C" case
    else if (fee === 399) limits = { tech: 4, cult: 3, total: 99 };
    else if (fee === 499) limits = { tech: 6, cult: 5, total: 99 };
  }

  console.log("[Debug] Final Limits Applied:", limits);
  return limits;
}

// --- Helper: Check if already registered ---
function alreadyRegistered(user, event_id) {
  const technical = user.technical.find(
    (item) => item.event.toString() === event_id.toString()
  );
  const cultural = user.cultural.find(
    (item) => item.event.toString() === event_id.toString()
  );
  return technical || cultural;
}

// --- Helper: Master Validation Function ---
// Returns existing error string or null if valid
function validateParticipant(user, event) {
  // 1. Check Payment Status
  if (user.status === "pending") {
    return `Payment status for ${user.name} (${user.festId}) is Pending.`;
  }

  // 2. Check if already registered in THIS event
  if (alreadyRegistered(user, event._id)) {
    return `${user.name} (${user.festId}) is already registered in this event.`;
  }

  // 3. Check Plan Limits
  const limits = getPlanLimits(user);
  const currentTechCount = user.technical.length;
  const currentCultCount = user.cultural.length;

  // Global total check (User for the 149 plan: 1T or 1C)
  if (currentTechCount + currentCultCount >= limits.total) {
    return `${user.name} (${user.festId}) has reached their total event limit of ${limits.total} (Plan: ₹${user.registrationFee}).`;
  }

  // Specific Category Checks
  if (event.eventType === "Technical" && currentTechCount >= limits.tech) {
    return `${user.name} (${user.festId}) has reached their limit of ${limits.tech} Technical events.`;
  }
  
  if (event.eventType === "Cultural" && currentCultCount >= limits.cult) {
    return `${user.name} (${user.festId}) has reached their limit of ${limits.cult} Cultural events.`;
  }

  return null; // All checks passed
}

export async function POST(req) {
  const { token, event_id, team_name, team_members } = await req.json();
  connect();
  
  try {
    const userID = await getDataFromToken(token);
    const user = await User.findById(userID)
      .populate("technical")
      .populate("cultural");

    if (!user) {
      return NextResponse.json({ success: false, message: "User is Not Logged In" });
    }

    const event = await Event.findById(event_id);
    if (!event) {
      return NextResponse.json({ success: false, message: "Event Not Found" });
    }
    
    // Validate Team Name presence if required
    if (!team_name && event.max > 1) { // Assuming individual events might not need a team name
       return NextResponse.json({ success: false, message: "Team name is Required" });
    }

    // --- Validate Current User (Team Leader) ---
    const userError = validateParticipant(user, event);
    if (userError) {
      return NextResponse.json({ success: false, message: userError });
    }

    // --- Handle Individual Registration ---
    if (event.max === 1) {
      const newParticipation = await Participation.create({
        event: event_id,
        teamName: team_name || user.name,
        participants: [user._id],
      });

      // Update User
      const updateField = event.eventType === "Technical" ? { technical: newParticipation._id } : { cultural: newParticipation._id };
      await User.findByIdAndUpdate(user._id, { $push: updateField });

      return NextResponse.json({
        success: true,
        message: "Registered for Event Successfully!",
        data: newParticipation,
      });
    }

    // --- Handle Team Registration ---
    let userArray = [user._id]; // Start with the logged-in user

    // Iterate through team members
    // Note: Use a generic loop (like your first snippet) as it's cleaner than team_member_1, 2, 3
    if (team_members && team_members.length > 0) {
      for (let i = 0; i < team_members.length; i++) {
        const memberIdInput = team_members[i].festId || team_members[i]; // Handle object or string input
        
        const member = await User.findOne({
          festId: memberIdInput.toUpperCase(),
        })
          .populate("technical")
          .populate("cultural");

        if (!member) {
          return NextResponse.json({
            success: false,
            message: `Team Member with ID ${memberIdInput} not found.`,
          });
        }

        // Validate Member
        const memberError = validateParticipant(member, event);
        if (memberError) {
          return NextResponse.json({ success: false, message: memberError });
        }

        // Check for Duplicates in the current team request
        if (userArray.find((id) => id.toString() === member._id.toString())) {
          return NextResponse.json({
            success: false,
            message: `User ${member.festId} is added twice in the team.`,
          });
        }

        userArray.push(member._id);
      }
    }

    // Check Event Size Limits
    if (userArray.length < event.min || userArray.length > event.max) {
      return NextResponse.json({
        success: false,
        message: `This event requires ${event.min}-${event.max} participants. You have ${userArray.length}.`,
      });
    }

    // Create Participation
    const newParticipation = await Participation.create({
      event: event._id,
      teamName: team_name,
      participants: userArray,
    });

    // Update All Users
    const updateQuery = event.eventType === "Technical" 
      ? { $push: { technical: newParticipation._id } } 
      : { $push: { cultural: newParticipation._id } };

    await Promise.all(
      userArray.map(userId => User.findByIdAndUpdate(userId, updateQuery))
    );

    return NextResponse.json({
      success: true,
      message: "Team Registered Successfully!",
      data: newParticipation,
    });

  } catch (err) {
    return NextResponse.json({
      error: err.message,
      success: false,
      message: "Internal Server Error during registration.",
    });
  }
}