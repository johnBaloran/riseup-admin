import Stripe from "stripe";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/emails/email-template";
import { render } from "@react-email/render";
import InstalmentUpcoming from "@/emails/InstalmentUpcoming";
import InstalmentFailed from "@/emails/InstalmentFailed";
import InstalmentSuccess from "@/emails/InstalmentSuccess";

import Player from "@/api-helpers/models/Player";
import Team from "@/api-helpers/models/Team";
import User from "@/api-helpers/models/User";
import Division from "@/api-helpers/models/Division";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/api-helpers/utils";
import { google } from "googleapis";
import TournamentTeam from "@/api-helpers/models/TournamentTeam";
import TournamentDivision from "@/api-helpers/models/TournamentDivision";
import { JoinTeamReminderTemplate } from "@/components/emails/join-team-reminder";
import { createOrUpdatePaymentMethod } from "@/utils/createOrUpdatePaymentMethod";
import PaymentMethod from "@/api-helpers/models/PaymentMethod";
import twilio from "twilio";

/\*\*

- PHASE 1: Import types and constants for type safety.
-
- IMPORTANT: This is a CRITICAL file that handles all payment processing.
- We're ONLY adding types and constants - NO logic changes.
-
- Following Single Responsibility Principle: This webhook handles Stripe events.
- In Phase 2, we'll extract individual handlers for better separation.
  \*/
  import {
  REGISTRATION_STATUS,
  PAYMENT_TYPE,
  INSTALLMENT_PAYMENT_COUNT,
  } from "@/constants/registration";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
await connectToDatabase();

    let event: Stripe.Event;

    try {
    	// 1. Retrieve the event by verifying the signature using the raw body and secret
    	const body = await req.text();
    	// const signature = headers().get("Stripe-Signature") ?? "";
    	const signature = req.headers.get("Stripe-Signature");

    	event = stripe.webhooks.constructEvent(
    		body,
    		signature,
    		process.env.STRIPE_WEBHOOK_SECRET || ""
    	);
    } catch (err) {
    	return NextResponse.json(
    		{
    			message: `Webhook Error: ${
    				err instanceof Error ? err.message : "Unknown Error"
    			}`,
    		},
    		{ status: 400 }
    	);
    }

    // 2. Handle event type (add business logic here)
    if (event.type === "checkout.session.completed") {
    	const session = event.data.object;

    	/**
    	 * PHASE 1: Type the metadata for type safety.
    	 *
    	 * This ensures TypeScript knows the structure of the metadata object.
    	 * In Phase 2, we'll use type guards to narrow the type based on status.
    	 *
    	 * IMPORTANT: This is a type cast only - NO logic change.
    	 */
    	const metadata = JSON.parse(session.metadata.formObject);
    	console.log(`💰  Payment received!`);

    	/**
    	 * Handle Free Agent Registration
    	 *
    	 * A free agent is a player joining without a pre-existing team.
    	 * They either join a draft league or an existing team that needs players.
    	 */
    	if (metadata.status === REGISTRATION_STATUS.FREE_AGENT) {
    		if (metadata.draftLeague) {
    			const updatedUser = await User.findOne({
    				email: metadata.email,
    			}).populate({
    				path: "basketball",
    				select: "playerName freeAgent",
    			});

    			if (!updatedUser.stripeCustomerId) {
    				updatedUser.stripeCustomerId = session.customer;
    			}

    			const selectedDivision = await Division.findById(metadata.division)
    				.populate("prices.firstInstallment")
    				.populate("prices.installment")
    				.populate("prices.regular")
    				.populate("prices.earlyBird")
    				.populate("prices.regularInstallment");

    			const registeredPlayer = new Player({
    				division: metadata.division,
    				freeAgent: true,
    				team: metadata.team,
    				playerName: metadata.playerName,
    				instagram: metadata.instagram,
    				jerseyNumber: metadata.jerseyNumber,
    				jerseySize: metadata.jerseySize,
    				jerseyName: metadata.jerseyName,
    				agreeToRefundPolicy: metadata.agreeToRefundPolicy,
    				agreeToTerms: metadata.agreeToTerms,
    				receiveNews: metadata.receiveNews,
    				user: updatedUser._id,
    				averageStats: {
    					points: 0,
    					rebounds: 0,
    					assists: 0,
    					blocks: 0,
    					steals: 0,
    					threesMade: 0,
    					twosMade: 0,
    					freeThrowsMade: 0,
    				},
    			});

    			await registeredPlayer.save();
    			console.log("Registered player:", registeredPlayer);

    			// Check if current date is before early bird deadline
    			const isBeforeEarlyBirdDeadline = selectedDivision.earlyBirdDeadline
    				? new Date() < new Date(selectedDivision.earlyBirdDeadline)
    				: false;

    			await createOrUpdatePaymentMethod({
    				paymentType: "FULL_PAYMENT",
    				pricingTier: isBeforeEarlyBirdDeadline
    					? "EARLY_BIRD"
    					: "REGULAR",
    				originalPrice: isBeforeEarlyBirdDeadline
    					? selectedDivision.prices?.earlyBird?.amount
    					: selectedDivision.prices?.regular?.amount,
    				amountPaid: session.amount_total / 100,
    				player: registeredPlayer._id,
    				division: metadata.division,
    				status: "COMPLETED",
    				session,
    				metadata,
    			});

    			// Handle the rest of the code based on the existingPlayer
    			updatedUser.basketball = updatedUser.basketball.concat(
    				registeredPlayer._id
    			);

    			await updatedUser.save();

    			const emails = [updatedUser.email];

    			const emailPromises = Array.from(new Set(emails)).map(
    				(recipientEmail) => {
    					return resend.emails.send({
    						from: "Rise Up League <no-reply@riseupleague.com>",
    						to: recipientEmail,
    						reply_to: "support@riseupleague.com",
    						subject: "Registration Successful",
    						react: EmailTemplate({
    							firstName: updatedUser.name,
    							status: "welcome free agent",
    						}),
    					});
    				}
    			);

    			await Promise.all(emailPromises);
    		} else {
    			const updatedUser = await User.findOne({
    				email: metadata.email,
    			}).populate({
    				path: "basketball",
    				select: "playerName freeAgent",
    			});

    			// Set or use existing Stripe customer ID
    			if (!updatedUser.stripeCustomerId) {
    				updatedUser.stripeCustomerId = session.customer;
    			}
    			const stripeCustomerId = updatedUser.stripeCustomerId;

    			const selectedDivision = await Division.findById(metadata.division)
    				.populate("prices.firstInstallment")
    				.populate("prices.installment")
    				.populate("prices.regular")
    				.populate("prices.earlyBird")
    				.populate("prices.regularInstallment");

    			// Check if current date is before early bird deadline
    			const isBeforeEarlyBirdDeadline = selectedDivision.earlyBirdDeadline
    				? new Date() < new Date(selectedDivision.earlyBirdDeadline)
    				: false;

    			// Check if free agent is joining a specific team or division only
    			const isTeamBasedFreeAgent =
    				metadata.team && metadata.team !== "free-agent";
    			const selectedTeam = isTeamBasedFreeAgent
    				? await Team.findById(metadata.team)
    				: null;

    			let registeredPlayer;
    			/**
    			 * Check payment type to determine if we need to track installment payments.
    			 * Always store customerId for future reference (refunds, subscriptions, etc.)
    			 */
    			if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    				registeredPlayer = new Player({
    					customerId: stripeCustomerId, // Use existing or newly created customerId
    					division: metadata.division,
    					freeAgent: true,
    					...(isTeamBasedFreeAgent && { team: metadata.team }), // Only add team if joining specific team
    					playerName: metadata.playerName,
    					instagram: metadata.instagram,
    					agreeToRefundPolicy: metadata.agreeToRefundPolicy,
    					agreeToTerms: metadata.agreeToTerms,
    					receiveNews: metadata.receiveNews,
    					jerseyNumber: metadata.jerseyNumber,
    					jerseySize: metadata.jerseySize,
    					jerseyName: metadata.jerseyName,
    					user: updatedUser._id,
    					averageStats: {
    						points: 0,
    						rebounds: 0,
    						assists: 0,
    						blocks: 0,
    						steals: 0,
    						threesMade: 0,
    						twosMade: 0,
    						freeThrowsMade: 0,
    					},
    				});
    			} else {
    				registeredPlayer = new Player({
    					customerId: stripeCustomerId, // Store customerId for all payments
    					division: metadata.division,
    					freeAgent: true,
    					...(isTeamBasedFreeAgent && { team: metadata.team }), // Only add team if joining specific team
    					playerName: metadata.playerName,
    					instagram: metadata.instagram,
    					jerseyNumber: metadata.jerseyNumber,
    					jerseySize: metadata.jerseySize,
    					jerseyName: metadata.jerseyName,
    					agreeToRefundPolicy: metadata.agreeToRefundPolicy,
    					agreeToTerms: metadata.agreeToTerms,
    					receiveNews: metadata.receiveNews,
    					user: updatedUser._id,
    					averageStats: {
    						points: 0,
    						rebounds: 0,
    						assists: 0,
    						blocks: 0,
    						steals: 0,
    						threesMade: 0,
    						twosMade: 0,
    						freeThrowsMade: 0,
    					},
    				});
    			}

    			await registeredPlayer.save();
    			console.log("Registered player:", registeredPlayer);

    			// Only add player to team if joining a specific team
    			if (isTeamBasedFreeAgent && selectedTeam) {
    				selectedTeam.players = selectedTeam.players.concat(
    					registeredPlayer._id
    				);
    				await selectedTeam.save();
    			}

    			/**
    			 * Create payment method tracking for installment payments.
    			 * Total installment price = first payment + (weekly amount × 7 payments)
    			 */
    			if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    				const firstInstallmentAmount =
    					selectedDivision.prices?.firstInstallment?.amount || 0;
    				// Calculate correct total price
    				const weeklyAmount = isBeforeEarlyBirdDeadline
    					? selectedDivision?.prices?.installment?.amount // $25
    					: selectedDivision?.prices?.regularInstallment?.amount; // $30

    				/**
    				 * Total price = first installment + (7 weekly payments)
    				 * Using INSTALLMENT_PAYMENT_COUNT constant ensures consistency
    				 * across all payment calculations.
    				 */
    				const totalInstallmentPrice =
    					firstInstallmentAmount + weeklyAmount * INSTALLMENT_PAYMENT_COUNT;

    				await createOrUpdatePaymentMethod({
    					paymentType: "INSTALLMENTS",
    					pricingTier: isBeforeEarlyBirdDeadline
    						? "EARLY_BIRD"
    						: "REGULAR",
    					originalPrice: totalInstallmentPrice,
    					amountPaid: session.amount_total / 100,
    					player: registeredPlayer._id,
    					division: metadata.division,
    					status: "IN_PROGRESS",
    					session,
    					metadata,
    				});
    			} else {
    				await createOrUpdatePaymentMethod({
    					paymentType: "FULL_PAYMENT",
    					pricingTier: isBeforeEarlyBirdDeadline
    						? "EARLY_BIRD"
    						: "REGULAR",
    					originalPrice: isBeforeEarlyBirdDeadline
    						? selectedDivision.prices?.earlyBird?.amount
    						: selectedDivision.prices?.regular?.amount,
    					amountPaid: session.amount_total / 100,
    					player: registeredPlayer._id,
    					division: metadata.division,
    					status: "COMPLETED",
    					session,
    					metadata,
    				});
    			}

    			// Handle the rest of the code based on the existingPlayer
    			updatedUser.basketball = updatedUser.basketball.concat(
    				registeredPlayer._id
    			);

    			await updatedUser.save();

    			/**
    			 * Set up Stripe subscription schedule for installment payments.
    			 * Phase 1: First payment (different amount)
    			 * Phase 2: 7 weekly recurring payments
    			 */
    			if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    				// Determine which weekly installment price to use
    				const weeklyInstallmentPrice = isBeforeEarlyBirdDeadline
    					? selectedDivision?.prices?.installment // $25 for early bird
    					: selectedDivision?.prices?.regularInstallment; // $30 for regular

    				let schedule = await stripe.subscriptionSchedules.create({
    					from_subscription: session.subscription as string,
    				});

    				const updatedPhases: Stripe.SubscriptionScheduleUpdateParams.Phase[] =
    					[
    						{
    							items: [
    								{
    									price: selectedDivision?.prices?.firstInstallment?.priceId, // Always $60
    									quantity: 1,
    								},
    							],
    							start_date: schedule.phases[0].start_date,
    							end_date: schedule.phases[0].end_date,
    						},
    						{
    							items: [
    								{
    									price: weeklyInstallmentPrice?.priceId, // Dynamic based on tier
    									quantity: 1,
    								},
    							],
    							start_date: schedule.phases[0].end_date,
    							/**
    							 * Number of weekly recurring payments after the first installment.
    							 * Using constant ensures this matches payment calculations everywhere.
    							 */
    							iterations: INSTALLMENT_PAYMENT_COUNT,
    						},
    					];

    				schedule = await stripe.subscriptionSchedules.update(schedule.id, {
    					end_behavior: "cancel",
    					phases: updatedPhases,
    				});
    			}

    			const emails = [updatedUser.email];

    			const emailPromises = Array.from(new Set(emails)).map(
    				(recipientEmail) => {
    					return resend.emails.send({
    						from: "Rise Up League <no-reply@riseupleague.com>",
    						to: recipientEmail,
    						reply_to: "support@riseupleague.com",
    						subject: "Registration Successful",
    						react: EmailTemplate({
    							firstName: updatedUser.name,
    							status: "welcome free agent",
    						}),
    					});
    				}
    			);

    			await Promise.all(emailPromises);
    		}
    	}

    	/**
    	 * Handle Create Team Registration
    	 *
    	 * A captain creates a new team and can either:
    	 * 1. Pay player discount (50%) and invite other players to pay individually
    	 * 2. Pay full team price upfront (all players free)
    	 *
    	 * Note: All captains are now playing captains.
    	 */
    	if (
    		metadata.status === REGISTRATION_STATUS.CREATE_TEAM &&
    		metadata.teamName !== ""
    	) {
    		console.log("Step 1: Starting createTeam process");
    		console.log("metadata:", metadata);
    		const updatedUser = await User.findById(metadata.userId);
    		console.log("Step 2: Fetched updatedUser:", updatedUser);

    		const selectedDivision = await Division.findById(
    			metadata.division
    		).populate([
    			{
    				path: "prices.regular",
    				model: "Price",
    				select: "name priceId amount type",
    			},
    			{
    				path: "prices.earlyBird",
    				model: "Price",
    				select: "name priceId amount type",
    			},
    		]);
    		console.log("Step 3: Fetched selectedDivision:", selectedDivision);

    		// Check if current date is before early bird deadline
    		const isBeforeEarlyBirdDeadline = selectedDivision.earlyBirdDeadline
    			? new Date() < new Date(selectedDivision.earlyBirdDeadline)
    			: false;

    		// Update team
    		const divisionToJoin = await Division.findOne({
    			_id: selectedDivision._id.toString(),
    		}).populate({
    			path: "teams",
    			select: "teamName",
    		});
    		console.log(
    			"Step 4: Fetched and populated divisionToJoin:",
    			divisionToJoin
    		);

    		const unpaidTeamToPay = updatedUser.unpaidTeams.find((team) => {
    			return team.division._id.toString() === metadata.division.toString();
    		});

    		console.log("Step 5: Found unpaidTeamToPay:", unpaidTeamToPay);

    		if (unpaidTeamToPay) {
    			updatedUser.unpaidTeams = updatedUser.unpaidTeams.map((unpaidTeam) => {
    				// Check if this is the unpaid team that needs to be updated
    				if (
    					unpaidTeam.division._id.toString() === metadata.division.toString()
    				) {
    					return {
    						...unpaidTeam,
    						paid: true, // Mark the team as paid
    					};
    				}
    				// Return the team unchanged if it's not the one to update
    				return unpaidTeam;
    			});
    		}

    		const newTeam = new Team({
    			teamName: unpaidTeamToPay.teamDetails.teamName,
    			teamNameShort: unpaidTeamToPay.teamDetails.teamNameShort,
    			teamCode: unpaidTeamToPay.teamDetails.teamCode,
    			paid: metadata.paid === true ? true : false,
    			wins: 0,
    			losses: 0,
    			pointDifference: 0,
    			averageStats: {
    				points: 0,
    				rebounds: 0,
    				assists: 0,
    				blocks: 0,
    				steals: 0,
    				threesMade: 0,
    				twosMade: 0,
    				freeThrowsMade: 0,
    			},
    			division: selectedDivision._id.toString(),
    			...(metadata.isTeamFee && {
    				allowJersey: true,
    			}),
    		});
    		console.log("Step 6: Created newTeam object:", newTeam);

    		// Save the new team to the database
    		const savedTeam = await newTeam.save();
    		console.log("Step 7: Saved new team to database:", savedTeam);

    		selectedDivision.teams = selectedDivision.teams.concat(savedTeam._id);
    		await selectedDivision.save();
    		console.log(
    			"Step 8: Added new team to selectedDivision and saved:",
    			selectedDivision
    		);

    		const updatedTeam = await Team.findById(savedTeam._id);

    		// All captains are playing captains - register as player
    		const newPlayerFields = {
    			division: selectedDivision._id.toString(),
    			team: savedTeam._id,
    			teamCaptain: true,
    			playerName: unpaidTeamToPay.teamCaptainDetails.playerName,
    			instagram: unpaidTeamToPay.teamCaptainDetails.instagram,
    			jerseyNumber: unpaidTeamToPay.teamCaptainDetails.jerseyNumber,
    			jerseySize: unpaidTeamToPay.teamCaptainDetails.jerseySize,
    			jerseyName: unpaidTeamToPay.teamCaptainDetails.jerseyName,
    			agreeToRefundPolicy: unpaidTeamToPay.checkboxes.agreeToRefundPolicy,
    			agreeToTerms: unpaidTeamToPay.checkboxes.agreeToTerms,
    			receiveNews: unpaidTeamToPay.checkboxes.receiveNews,
    			user: updatedUser._id,
    			averageStats: {
    				points: 0,
    				rebounds: 0,
    				assists: 0,
    				blocks: 0,
    				steals: 0,
    				threesMade: 0,
    				twosMade: 0,
    				freeThrowsMade: 0,
    			},
    		};

    		console.log("Step 9: Prepared newPlayerFields:", newPlayerFields);

    		/**
    		 * If captain chose installment payment, save Stripe customerId
    		 * for subscription tracking.
    		 */
    		let registeredPlayer;
    		if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    			registeredPlayer = new Player({
    				...newPlayerFields,
    				customerId: session.customer,
    			});
    		} else {
    			registeredPlayer = new Player({
    				...newPlayerFields,
    			});
    		}
    		console.log(
    			"Step 10: Created registeredPlayer object:",
    			registeredPlayer
    		);

    		await registeredPlayer.save();
    		console.log("Step 11: Saved registered player:", registeredPlayer);

    		// Create payment method tracking
    		if (metadata.isTeamFee) {
    			await createOrUpdatePaymentMethod({
    				paymentType: "FULL_PAYMENT",
    				pricingTier: isBeforeEarlyBirdDeadline
    					? "EARLY_BIRD"
    					: "REGULAR",
    				originalPrice: session.amount_total / 100,
    				amountPaid: session.amount_total / 100,
    				player: registeredPlayer._id,
    				division: selectedDivision._id,
    				status: "COMPLETED",
    				session,
    				metadata,
    			});
    		} else {
    			await createOrUpdatePaymentMethod({
    				paymentType: "FULL_PAYMENT",
    				pricingTier: isBeforeEarlyBirdDeadline
    					? "EARLY_BIRD"
    					: "REGULAR",
    				originalPrice: isBeforeEarlyBirdDeadline
    					? selectedDivision.prices?.earlyBird?.amount / 2
    					: selectedDivision.prices?.regular?.amount / 2,
    				amountPaid: session.amount_total / 100,
    				player: registeredPlayer._id,
    				division: selectedDivision._id,
    				status: "COMPLETED",
    				session,
    				metadata,
    			});
    		}

    		console.log("Step 12: Fetched updated team:", updatedTeam);

    		// Save the team and user information
    		updatedTeam.players = updatedTeam.players.concat(registeredPlayer._id);
    		updatedTeam.teamCaptain = registeredPlayer._id;
    		updatedUser.basketball = updatedUser.basketball.concat(
    			registeredPlayer._id
    		);
    		console.log(
    			"Step 13: Updated team and user with registered player details:",
    			updatedUser
    		);

    		const dateSignUp = new Date(Date.now()); // Current date

    		// Create and save all players concurrently
    		const playerPromises = unpaidTeamToPay.players.map(async (player) => {
    			const newPlayer = new Player({
    				division: selectedDivision._id.toString(),
    				team: savedTeam._id,
    				teamCaptain: false,
    				playerName: player.name,
    				jerseyNumber: player.jerseyNumber,
    				jerseyName: player.jerseyName,
    				jerseySize: player.jerseySize,
    				averageStats: {
    					points: 0,
    					rebounds: 0,
    					assists: 0,
    					blocks: 0,
    					steals: 0,
    					threesMade: 0,
    					twosMade: 0,
    					freeThrowsMade: 0,
    				},
    				paymentStatus: {
    					hasPaid: false,
    					reminderCount: 0,
    					teamCreatedDate: dateSignUp,
    					lastAttempt: dateSignUp,
    					email: player.email,
    					phoneNumber: player.phoneNumber,
    				},
    			});
    			console.log("Step 14: Creating new player:", newPlayer);

    			const savedPlayer = await newPlayer.save();
    			console.log("Step 15: Saved new player to database:", savedPlayer);

    			return savedPlayer._id;
    		});

    		// Wait for all players to be saved and update the team
    		const playerIds = await Promise.all(playerPromises);
    		updatedTeam.players = updatedTeam.players.concat(playerIds);

    		await updatedTeam.save();
    		console.log("Step 16: Updated team with all player IDs:", playerIds);

    		if (!updatedUser.stripeCustomerId) {
    			updatedUser.stripeCustomerId = session.customer;
    		}

    		await updatedUser.save();
    		console.log("Step 17: Saved updated team and user to database");

    		/**
    		 * Send join team reminders only if captain paid player discount.
    		 * If they paid team fee upfront, no payment reminders needed.
    		 */
    		if (!metadata.isTeamFee) {
    			await fetch(
    				`${process.env.NEXT_PUBLIC_API_BASE_URL}api/send-join-team-reminders`,
    				{
    					method: "POST",
    					headers: {
    						"Content-Type": "application/json",
    					},
    					body: JSON.stringify({
    						teamId: savedTeam._id, // Pass the teamId if available
    					}),
    				}
    			);
    			console.log(
    				"Step 18: Sent join team email and sms reminders to roster"
    			);
    		}

    		/**
    		 * Set up installment payment schedule for captain who chose installments.
    		 * This is for createTeam flow only.
    		 */
    		if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    			let schedule = await stripe.subscriptionSchedules.create({
    				from_subscription: session.subscription as string,
    			});

    			const phases = schedule.phases.map((phase) => ({
    				start_date: phase.start_date,
    				end_date: phase.end_date,
    				items: phase.items,
    			}));

    			const updatedPhases: Stripe.SubscriptionScheduleUpdateParams.Phase[] = [
    				{
    					items: [
    						{
    							price: selectedDivision?.prices?.firstInstallment?.priceId, // Initial $25 payment
    							quantity: 1,
    						},
    					],
    					start_date: schedule.phases[0].start_date,
    					end_date: schedule.phases[0].end_date,
    				},
    				{
    					items: [
    						{
    							price: selectedDivision?.prices?.installment?.priceId, // $85 installment price ID
    							quantity: 1,
    						},
    					],
    					start_date: schedule.phases[0].end_date,
    					iterations: 3,
    				},
    			];

    			schedule = await stripe.subscriptionSchedules.update(schedule.id, {
    				end_behavior: "cancel",
    				phases: updatedPhases,
    			});
    		}

    		if (!metadata.isTeamFee) {
    			const emails = [updatedUser.email];

    			const emailPromises = Array.from(new Set(emails)).map(
    				(recipientEmail) => {
    					return resend.emails.send({
    						from: "Rise Up League <no-reply@riseupleague.com>",
    						to: recipientEmail,
    						reply_to: "support@riseupleague.com",
    						subject: "Registration Successful",
    						react: EmailTemplate({
    							firstName: updatedUser.name,
    							status: "welcome create team",
    						}),
    					});
    				}
    			);

    			await Promise.all(emailPromises);
    		}
    	}

    	/**
    	 * Handle Join Team Registration
    	 *
    	 * A player joins an existing team that was created by a captain.
    	 * The player can either:
    	 * 1. Pay full amount immediately
    	 * 2. Pay via installments (8 total payments)
    	 */
    	if (metadata.status === REGISTRATION_STATUS.JOIN_TEAM) {
    		const updatedUser = await User.findOne({
    			email: metadata.email,
    		});
    		console.log("updatedUser", updatedUser);

    		if (!updatedUser.stripeCustomerId) {
    			updatedUser.stripeCustomerId = session.customer;
    		}

    		const selectedDivision = await Division.findById(metadata.division)
    			.populate("prices.firstInstallment")
    			.populate("prices.installment")
    			.populate("prices.regular")
    			.populate("prices.earlyBird")
    			.populate("prices.regularInstallment");
    		console.log("selectedDivision", selectedDivision);

    		// Check if current date is before early bird deadline
    		const isBeforeEarlyBirdDeadline = selectedDivision.earlyBirdDeadline
    			? new Date() < new Date(selectedDivision.earlyBirdDeadline)
    			: false;

    		if (metadata.createdManually === true) {
    			const selectedTeam = await Team.findById(metadata.team);
    			console.log("selectedTeam", selectedTeam);

    			const newPlayer = new Player({
    				division: selectedTeam.division.toString(),
    				team: metadata.team.toString(),
    				playerName: metadata.playerName,
    				instagram: metadata.instagram,
    				jerseyNumber: metadata.jerseyNumber,
    				jerseySize: metadata.jerseySize,
    				jerseyName: metadata.jerseyName,
    				agreeToRefundPolicy: metadata.agreeToRefundPolicy,
    				agreeToTerms: metadata.agreeToTerms,
    				receiveNews: metadata.receiveNews,
    				user: updatedUser._id,
    				averageStats: {
    					points: 0,
    					rebounds: 0,
    					assists: 0,
    					blocks: 0,
    					steals: 0,
    					threesMade: 0,
    					twosMade: 0,
    					freeThrowsMade: 0,
    				},
    			});
    			console.log("newPlayer", newPlayer);

    			await newPlayer.save();
    			console.log("Registered player:", newPlayer);
    			selectedTeam.players = selectedTeam.players.concat(newPlayer._id);
    			await selectedTeam.save();
    			console.log("selectedTeam", selectedTeam);

    			updatedUser.basketball = updatedUser.basketball.concat(newPlayer._id);

    			await updatedUser.save();
    			console.log("updatedUser", updatedUser);
    		} else {
    			const newPlayer = await Player.findById(metadata.playerId);
    			console.log("updatedUser:", updatedUser);
    			console.log("newPlayer:", newPlayer);
    			newPlayer.playerName = metadata.playerName;
    			newPlayer.instagram = metadata.instagram;
    			newPlayer.agreeToRefundPolicy = metadata.agreeToRefundPolicy;
    			newPlayer.agreeToTerms = metadata.agreeToTerms;
    			newPlayer.receiveNews = metadata.receiveNews;
    			newPlayer.user = updatedUser._id;
    			newPlayer.paymentStatus.hasPaid = true;

    			/**
    			 * Save Stripe customerId if using installments for subscription tracking.
    			 */
    			if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    				newPlayer.customerId = session.customer;
    			}
    			console.log("Registered player:", newPlayer);

    			await newPlayer.save();

    			/**
    			 * Create payment method tracking.
    			 * Total for installments = first payment + (7 weekly payments)
    			 */
    			if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    				const firstInstallmentAmount =
    					selectedDivision.prices?.firstInstallment?.amount || 0;

    				const weeklyAmount = isBeforeEarlyBirdDeadline
    					? selectedDivision?.prices?.installment?.amount // $25
    					: selectedDivision?.prices?.regularInstallment?.amount; // $30

    				/**
    				 * Calculate total installment price consistently across all flows.
    				 */
    				const totalInstallmentPrice =
    					firstInstallmentAmount + weeklyAmount * INSTALLMENT_PAYMENT_COUNT;

    				await createOrUpdatePaymentMethod({
    					paymentType: "INSTALLMENTS",
    					pricingTier: isBeforeEarlyBirdDeadline
    						? "EARLY_BIRD"
    						: "REGULAR",
    					originalPrice: totalInstallmentPrice,
    					amountPaid: session.amount_total / 100,
    					player: newPlayer._id,
    					division: metadata.division,
    					status: "IN_PROGRESS",
    					session,
    					metadata,
    				});
    			} else {
    				await createOrUpdatePaymentMethod({
    					paymentType: "FULL_PAYMENT",
    					pricingTier: isBeforeEarlyBirdDeadline
    						? "EARLY_BIRD"
    						: "REGULAR",
    					originalPrice: isBeforeEarlyBirdDeadline
    						? selectedDivision.prices?.earlyBird?.amount
    						: selectedDivision.prices?.regular?.amount,
    					amountPaid: session.amount_total / 100,
    					player: newPlayer._id,
    					division: metadata.division,
    					status: "COMPLETED",
    					session,
    					metadata,
    				});
    			}
    			console.log("Registered player:", newPlayer);

    			// Handle the rest of the code based on the existingPlayer

    			updatedUser.basketball = updatedUser.basketball.concat(newPlayer._id);

    			await updatedUser.save();
    		}

    		/**
    		 * Set up Stripe subscription schedule for installment payments.
    		 * Same structure as free agent flow: first payment + 7 weekly payments.
    		 */
    		if (metadata.payment === PAYMENT_TYPE.INSTALLMENTS) {
    			// Determine which weekly installment price to use
    			const weeklyInstallmentPrice = isBeforeEarlyBirdDeadline
    				? selectedDivision?.prices?.installment // $25 for early bird
    				: selectedDivision?.prices?.regularInstallment; // $30 for regular

    			let schedule = await stripe.subscriptionSchedules.create({
    				from_subscription: session.subscription as string,
    			});

    			const updatedPhases: Stripe.SubscriptionScheduleUpdateParams.Phase[] = [
    				{
    					items: [
    						{
    							price: selectedDivision?.prices?.firstInstallment?.priceId, // Initial $60 payment
    							quantity: 1,
    						},
    					],
    					start_date: schedule.phases[0].start_date,
    					end_date: schedule.phases[0].end_date,
    				},
    				{
    					items: [
    						{
    							price: weeklyInstallmentPrice?.priceId, // Dynamic based on tier
    							quantity: 1,
    						},
    					],
    					start_date: schedule.phases[0].end_date,
    					/**
    					 * 7 weekly payments after the first installment.
    					 * Using constant for consistency across all payment flows.
    					 */
    					iterations: INSTALLMENT_PAYMENT_COUNT,
    				},
    			];

    			schedule = await stripe.subscriptionSchedules.update(schedule.id, {
    				end_behavior: "cancel",
    				phases: updatedPhases,
    			});
    		}
    		const emails = [updatedUser.email];

    		const emailPromises = Array.from(new Set(emails)).map(
    			(recipientEmail) => {
    				return resend.emails.send({
    					from: "Rise Up League <no-reply@riseupleague.com>",
    					to: recipientEmail,
    					reply_to: "support@riseupleague.com",
    					subject: "Registration Successful",
    					react: EmailTemplate({
    						firstName: updatedUser.name,
    						status: "welcome join team",
    					}),
    				});
    			}
    		);

    		await Promise.all(emailPromises);
    	}

    	const auth = new google.auth.GoogleAuth({
    		credentials: {
    			client_email: process.env.CLIENT_EMAIL,
    			client_id: process.env.CLIENT_ID,
    			private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // Replace \\n with actual line breaks
    		},
    		scopes: [
    			"https://www.googleapis.com/auth/drive",
    			"https://www.googleapis.com/auth/drive.file",
    			"https://www.googleapis.com/auth/spreadsheets",
    		],
    	});

    	const sheets = google.sheets({
    		auth,
    		version: "v4",
    	});

    	const dateSignUp = new Date(Date.now()); // Current date

    	const dateSignUpOptions: Intl.DateTimeFormatOptions = {
    		weekday: "long", // "Friday"
    		year: "numeric", // "2024"
    		month: "long", // "September"
    		day: "numeric", // "27"
    	};

    	const formattedDateSignUp = dateSignUp.toLocaleDateString(
    		"en-US",
    		dateSignUpOptions
    	);

    	const response = await sheets.spreadsheets.values.append({
    		spreadsheetId: "1uFrrYeBPut9A0_6zvC90YJm22FRBXAuL_pG64bJmymU",
    		range: "winter2025!A2:K",
    		valueInputOption: "USER_ENTERED",
    		requestBody: {
    			values: [
    				[
    					metadata.status,
    					metadata.teamName,
    					metadata.playerName,
    					metadata.instagram,
    					metadata.phoneNumber,
    					metadata.email,
    					metadata.divisionName,
    					/**
    					 * Log whether payment was via installments for tracking purposes.
    					 */
    					metadata.payment === PAYMENT_TYPE.INSTALLMENTS ? "Yes" : "No",
    					formattedDateSignUp,
    					metadata.isTeamFee,
    					metadata.cityName,
    				],
    			],
    		},
    	});
    } else if (event.type === "invoice.payment_failed") {
    	const session = event.data.object;

    	if (session.billing_reason === "subscription_cycle") {
    		const invoiceFailed = event.data.object;
    		console.log(`Payment failed for invoice ${invoiceFailed.id}`);

    		// Find the player document
    		const playerFailed = await Player.findOne({
    			customerId: invoiceFailed.customer,
    		}).populate("user"); // Populate the user field

    		if (playerFailed) {
    			const paymentMethod = await PaymentMethod.findOne({
    				player: playerFailed._id,
    				paymentType: "INSTALLMENTS",
    				"installments.subscriptionId": session.subscription,
    			});

    			if (paymentMethod) {
    				// Check if this invoice already has a payment record
    				const existingPaymentIndex =
    					paymentMethod.installments.subscriptionPayments.findIndex(
    						(payment) => payment.invoiceId === invoiceFailed.id
    					);

    				if (existingPaymentIndex === -1) {
    					// If no existing payment, create new one
    					paymentMethod.installments.subscriptionPayments.push({
    						invoiceId: invoiceFailed.id,
    						status: "failed",
    						amountPaid: 0,
    						attemptCount: invoiceFailed.attempt_count || 1,
    						lastAttempt: new Date(),
    						paymentLink: invoiceFailed.hosted_invoice_url,
    						paymentNumber:
    							paymentMethod.installments.subscriptionPayments.length + 1,
    						dueDate: new Date(invoiceFailed.lines.data[0].period.end * 1000),
    					});
    				} else {
    					// Update existing payment while preserving all fields
    					const existingPayment =
    						paymentMethod.installments.subscriptionPayments[
    							existingPaymentIndex
    						];
    					paymentMethod.installments.subscriptionPayments[
    						existingPaymentIndex
    					] = {
    						invoiceId: existingPayment.invoiceId, // Preserve the original invoiceId
    						status: "failed",
    						amountPaid: 0,
    						attemptCount:
    							invoiceFailed.attempt_count || existingPayment.attemptCount + 1,
    						lastAttempt: new Date(),
    						paymentLink: invoiceFailed.hosted_invoice_url,
    						paymentNumber: existingPayment.paymentNumber, // Preserve the original payment number
    						dueDate: existingPayment.dueDate, // Preserve the original due date
    						_id: existingPayment._id, // Preserve the original _id
    					};
    				}

    				paymentMethod.installments.nextPaymentDate = new Date(
    					invoiceFailed.lines.data[0].period.end * 1000
    				);
    				await paymentMethod.save();
    			}

    			// Check if a subscription payment with the same invoiceId already exists
    			const existingFailedPayment = playerFailed.subscriptionPayments.find(
    				(payment) => payment.invoiceId === invoiceFailed.id
    			);

    			if (existingFailedPayment) {
    				// Update the existing payment record
    				await Player.updateOne(
    					{ "subscriptionPayments.invoiceId": invoiceFailed.id },
    					{
    						$set: {
    							"subscriptionPayments.$.status": "failed",
    							"subscriptionPayments.$.amountPaid": 0,
    							"subscriptionPayments.$.attemptCount":
    								invoiceFailed.attempt_count ||
    								existingFailedPayment.attemptCount,
    							"subscriptionPayments.$.lastAttempt": new Date(),
    							"subscriptionPayments.$.paymentLink":
    								invoiceFailed.hosted_invoice_url, // Add payment link
    						},
    					}
    				);
    			} else {
    				// Add a new payment record
    				await Player.findOneAndUpdate(
    					{ customerId: invoiceFailed.customer },
    					{
    						$push: {
    							subscriptionPayments: {
    								invoiceId: invoiceFailed.id,
    								status: "failed",
    								amountPaid: 0,
    								attemptCount: invoiceFailed.attempt_count || 1,
    								lastAttempt: new Date(),
    								paymentLink: invoiceFailed.hosted_invoice_url, // Add payment link
    							},
    						},
    					}
    				);
    			}

    			const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
    			const token = process.env.TWILIO_AUTH_TOKEN as string;
    			const messagingService = process.env.TWILIO_MESSAGING_SERVICE_SID;
    			const client = twilio(accountSid, token);

    			const paymentNumber =
    				playerFailed.subscriptionPayments.filter(
    					(item) => item.status === "succeeded"
    				).length + 1;
    			const emails = [playerFailed.user.email, "support@riseupleague.com"];
    			const userFirstName = playerFailed.user.name;
    			const userPhoneNumber = playerFailed.user.phoneNumber;

    			const paymentPrice = `${invoiceFailed.amount_due / 100}`;
    			const dueDate = new Date(invoiceFailed.lines.data[0].period.end * 1000)
    				.toISOString()
    				.split("T")[0]; // Convert Unix timestamp to ISO date
    			const paymentLink = invoiceFailed.hosted_invoice_url;

    			const emailPromises = Array.from(new Set(emails)).map(
    				(recipientEmail) => {
    					return resend.emails.send({
    						from: "Rise Up League <no-reply@riseupleague.com>",
    						to: recipientEmail,
    						reply_to: "support@riseupleague.com",
    						subject: "Missed Payment!",
    						html: render(
    							InstalmentFailed({
    								userFirstName,
    								paymentPrice,
    								dueDate,
    								paymentNumber,
    								paymentLink,
    							})
    						),
    					});
    				}
    			);

    			// Send SMS using Twilio
    			const smsPromise = client.messages.create({
    				body: `RISEUP URGENT: ${userFirstName}, your $${paymentPrice} payment FAILED! GAME SUSPENSION if not paid TODAY. Pay NOW to avoid missing games: ${paymentLink}`,
    				from: messagingService,
    				to: userPhoneNumber,
    			});

    			await Promise.all([...emailPromises, smsPromise]);
    		} else {
    			console.warn(
    				"No player found with the given customerId:",
    				invoiceFailed.customer
    			);
    		}
    	}
    }

    // else if (event.type === "invoice.updated") {
    // 	const session = event.data.object;

    // 	if (session.billing_reason === "subscription_cycle") {
    // 		const invoiceUpcoming = event.data.object;
    // 		console.log(`Payment upcoming for invoice ${invoiceUpcoming.id}`);

    // 		// Find the player document
    // 		const playerUpcoming = await Player.findOne({
    // 			customerId: invoiceUpcoming.customer,
    // 		}).populate("user"); // Populate the user field

    // 		if (playerUpcoming) {
    // 			const paymentNumber =
    // 				playerUpcoming.subscriptionPayments.filter(
    // 					(item) => item.status === "succeeded"
    // 				).length + 1;
    // 			const emails = [
    // 				playerUpcoming.user.email,
    // 				"riseupbballleague@gmail.com",
    // 			];
    // 			const userFirstName = playerUpcoming.user.name;
    // 			const paymentPrice = `$${invoiceUpcoming.amount_due / 100}`;
    // 			const unformattedDueDate = new Date(
    // 				invoiceUpcoming.lines.data[0].period.end * 1000
    // 			); // Convert Unix timestamp to JS date

    // 			const dueDate = unformattedDueDate.toLocaleDateString("en-US", {
    // 				weekday: "short", // Short weekday (e.g., "Fri.")
    // 				day: "numeric", // Numeric day (e.g., "13")
    // 				month: "short", // Short month (e.g., "Sep.")
    // 				year: "numeric", // Full year (e.g., "2024")
    // 			});
    // 			const emailPromises = Array.from(new Set(emails)).map(
    // 				(recipientEmail) => {
    // 					return resend.emails.send({
    // 						from: "Rise Up League <no-reply@riseupleague.com>",
    // 						to: recipientEmail,
    // 						reply_to: "support@riseupleague.com",
    // 						subject: "Payment Reminder",
    // 						html: render(
    // 							InstalmentUpcoming({
    // 								userFirstName,
    // 								paymentPrice,
    // 								dueDate,
    // 								paymentNumber,
    // 							})
    // 						),
    // 					});
    // 				}
    // 			);

    // 			await Promise.all(emailPromises);
    // 		} else {
    // 			console.warn(
    // 				"No player found with the given customerId:",
    // 				invoiceUpcoming.customer
    // 			);
    // 		}
    // 	}
    // }
    else if (event.type === "invoice.payment_succeeded") {
    	const invoiceSuccess = event.data.object;

    	console.log(`Payment succeeded for invoice ${invoiceSuccess.id}`);

    	// Find the player document
    	const player = await Player.findOne({
    		customerId: invoiceSuccess.customer,
    	}).populate("user"); // Populate the user field

    	if (player) {
    		// Add this: Update PaymentMethod
    		const paymentMethod = await PaymentMethod.findOne({
    			player: player._id,
    			paymentType: "INSTALLMENTS",
    			"installments.subscriptionId": invoiceSuccess.subscription,
    		});

    		if (paymentMethod) {
    			// Check if this invoice has already been recorded
    			const existingPaymentIndex =
    				paymentMethod.installments.subscriptionPayments.findIndex(
    					(payment) => payment.invoiceId === invoiceSuccess.id
    				);

    			if (existingPaymentIndex === -1) {
    				paymentMethod.installments.subscriptionPayments.push({
    					invoiceId: invoiceSuccess.id,
    					status: "succeeded",
    					amountPaid: invoiceSuccess.amount_paid / 100,
    					attemptCount: invoiceSuccess.attempt_count || 1,
    					lastAttempt: new Date(),
    					paymentLink: invoiceSuccess.hosted_invoice_url,
    					paymentNumber:
    						paymentMethod.installments.subscriptionPayments.length + 1,
    					dueDate: new Date(invoiceSuccess.lines.data[0].period.end * 1000),
    				});
    			} else {
    				// Payment exists - update it to succeeded
    				const existingPayment =
    					paymentMethod.installments.subscriptionPayments[
    						existingPaymentIndex
    					];
    				paymentMethod.installments.subscriptionPayments[
    					existingPaymentIndex
    				] = {
    					...existingPayment, // Preserve all existing fields
    					status: "succeeded",
    					amountPaid: invoiceSuccess.amount_paid / 100,
    					attemptCount:
    						invoiceSuccess.attempt_count || existingPayment.attemptCount,
    					lastAttempt: new Date(),
    					paymentLink: invoiceSuccess.hosted_invoice_url,
    				};
    			}

    			// Update remaining balance and status
    			const totalPaid = paymentMethod.installments.subscriptionPayments
    				.filter((payment) => payment.status === "succeeded")
    				.reduce((sum, payment) => sum + payment.amountPaid, 0);

    			paymentMethod.installments.remainingBalance =
    				paymentMethod.installments.totalAmountDue - totalPaid;
    			paymentMethod.amountPaid = totalPaid;

    			// If all payments are made, update status
    			if (totalPaid >= paymentMethod.installments.totalAmountDue) {
    				paymentMethod.status = "COMPLETED";
    			}

    			await paymentMethod.save();
    		}

    		// Check if a subscription payment with the same invoiceId already exists
    		const existingPayment = player.subscriptionPayments.find(
    			(payment) => payment.invoiceId === invoiceSuccess.id
    		);

    		if (existingPayment) {
    			// Update the existing payment record
    			await Player.updateOne(
    				{ "subscriptionPayments.invoiceId": invoiceSuccess.id },
    				{
    					$set: {
    						"subscriptionPayments.$.status": "succeeded",
    						"subscriptionPayments.$.amountPaid": invoiceSuccess.amount_paid,
    						"subscriptionPayments.$.attemptCount":
    							invoiceSuccess.attempt_count || existingPayment.attemptCount,
    						"subscriptionPayments.$.lastAttempt": new Date(),
    						"subscriptionPayments.$.paymentLink":
    							invoiceSuccess.hosted_invoice_url, // Add payment link
    					},
    				}
    			);
    		} else {
    			// Add a new payment record
    			await Player.findOneAndUpdate(
    				{ customerId: invoiceSuccess.customer },
    				{
    					$push: {
    						subscriptionPayments: {
    							invoiceId: invoiceSuccess.id,
    							status: "succeeded",
    							amountPaid: invoiceSuccess.amount_paid,
    							attemptCount: invoiceSuccess.attempt_count || 1,
    							lastAttempt: new Date(),
    							paymentLink: invoiceSuccess.hosted_invoice_url, // Add payment link
    						},
    					},
    				}
    			);
    		}

    		const paymentNumber =
    			player.subscriptionPayments.filter(
    				(item) => item.status === "succeeded"
    			).length + 1;

    		const userFirstName = player.user.name;
    		const paymentPrice = `${invoiceSuccess.amount_paid / 100}`;
    		const currentDate = new Date(Date.now());

    		const paymentDate = currentDate.toLocaleDateString("en-US", {
    			weekday: "short", // Short weekday (e.g., "Fri.")
    			day: "numeric", // Numeric day (e.g., "13")
    			month: "short", // Short month (e.g., "Sep.")
    			year: "numeric", // Full year (e.g., "2024")
    		});
    		const emails = [player.user.email, "support@riseupleague.com"];

    		const emailPromises = Array.from(new Set(emails)).map(
    			(recipientEmail) => {
    				return resend.emails.send({
    					from: "Rise Up League <no-reply@riseupleague.com>",
    					to: recipientEmail,
    					reply_to: "support@riseupleague.com",
    					subject: "Thanks for your payment!",
    					html: render(
    						InstalmentSuccess({
    							userFirstName,
    							paymentPrice,
    							paymentDate,
    							paymentNumber,
    						})
    					),
    				});
    			}
    		);
    		await Promise.all(emailPromises);
    	} else {
    		console.warn(
    			"No player found with the given customerId:",
    			invoiceSuccess.customer
    		);
    	}
    } else {
    	console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    // 3. Return a response to acknowledge receipt of the event.
    return NextResponse.json({ received: true });

}
