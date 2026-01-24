import {
	Action,
	ActionPanel,
	Color,
	getPreferenceValues,
	Icon,
	List,
	updateCommandMetadata,
} from "@raycast/api";
import React, { useEffect, useState } from "react";
import {
	clearTodayStartTime,
	getTodayStartTime,
	setTodayStartTime,
} from "./lib/storage";
import {
	calculateLeaveTime,
	calculateRemainingTime,
	formatTimeString,
} from "./lib/time-utils";

// Get current time in HH:MM format
const getCurrentTimeString = () => {
	const now = new Date();
	return formatTimeString(now.getHours(), now.getMinutes());
};

// Generate once outside component (performance optimization)
const START_TIMES = (() => {
	const times: string[] = [];
	for (let h = 7; h <= 13; h++) {
		for (const m of [0, 15, 30, 45]) {
			times.push(formatTimeString(h, m));
		}
	}
	return times;
})();

export default function Command() {
	const prefs = getPreferenceValues<Preferences.CalculateLeaveTime>();
	const workHours = parseFloat(prefs.defaultWorkHours || "8");
	const breakMins = parseInt(prefs.defaultBreakMinutes || "60", 10);

	const [todayStart, setTodayStart] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		getTodayStartTime().then((time) => {
			setTodayStart(time);
			setIsLoading(false);
		});
	}, []);

	// Current time (updated every minute)
	const [currentTime, setCurrentTime] = useState(getCurrentTimeString);

	// Dynamic subtitle update + periodic refresh
	const [, setTick] = useState(0);

	useEffect(() => {
		const updateSubtitle = async () => {
			if (todayStart) {
				const leave = calculateLeaveTime(todayStart, workHours, breakMins);
				const rem = calculateRemainingTime(leave, todayStart);
				const subtitle = rem.isPast
					? `${rem.hours}h ${rem.minutes}m overtime`
					: `${leave} leave - ${rem.hours}h ${rem.minutes}m left`;
				await updateCommandMetadata({ subtitle });
			} else {
				await updateCommandMetadata({ subtitle: "" });
			}
		};
		updateSubtitle();

		// Update every minute
		const interval = setInterval(() => {
			updateSubtitle();
			setCurrentTime(getCurrentTimeString());
			setTick((tick) => tick + 1); // Re-render UI
		}, 60000);

		return () => clearInterval(interval);
	}, [todayStart, workHours, breakMins]);

	const handleSelect = async (startTime: string) => {
		await setTodayStartTime(startTime);
		setTodayStart(startTime);
	};

	const handleClear = async () => {
		await clearTodayStartTime();
		setTodayStart(null);
	};

	// Parse custom time (formats: 9:21 or 09:21)
	const parseCustomTime = (input: string): string | null => {
		const match = input.match(/^(\d{1,2}):(\d{2})$/);
		if (!match) return null;
		const h = parseInt(match[1], 10);
		const m = parseInt(match[2], 10);
		if (h < 0 || h > 23 || m < 0 || m > 59) return null;
		return formatTimeString(h, m);
	};

	const customTime = parseCustomTime(searchText);

	// Calculate today's leave time and remaining time
	const leaveTime = todayStart
		? calculateLeaveTime(todayStart, workHours, breakMins)
		: null;
	const remaining = leaveTime
		? calculateRemainingTime(leaveTime, todayStart)
		: null;

	const filteredTimes = searchText
		? START_TIMES.filter((time) => time.includes(searchText))
		: START_TIMES;

	return (
		<List
			isLoading={isLoading}
			searchBarPlaceholder="Enter time (e.g., 9:21)"
			onSearchTextChange={setSearchText}
		>
			{/* Today's schedule (if set) */}
			{todayStart && leaveTime && remaining && (
				<List.Section title="📅 Today">
					<List.Item
						title={`🏠 Leave at ${leaveTime}`}
						subtitle={
							remaining.isPast
								? `${remaining.hours}h ${remaining.minutes}m overtime`
								: `${remaining.hours}h ${remaining.minutes}m left`
						}
						icon={{
							source: Icon.Clock,
							tintColor: remaining.isPast ? Color.Orange : Color.Blue,
						}}
						accessories={[
							{ tag: { value: todayStart, color: Color.SecondaryText } },
							{
								tag: {
									value: `Work ${workHours}h Break ${breakMins}m`,
									color: Color.SecondaryText,
								},
							},
						]}
						actions={
							<ActionPanel>
								<Action.CopyToClipboard title="Copy" content={leaveTime} />
								<Action
									title="Reset"
									icon={Icon.Trash}
									style={Action.Style.Destructive}
									onAction={handleClear}
								/>
							</ActionPanel>
						}
					/>
				</List.Section>
			)}

			{/* Start now (current time) */}
			{!searchText && (
				<List.Section title="🚀 Start Now">
					<List.Item
						title={`Now (${currentTime})`}
						icon={{ source: Icon.Clock, tintColor: Color.Green }}
						accessories={[
							{
								text: `→ ${calculateLeaveTime(currentTime, workHours, breakMins)}`,
							},
						]}
						actions={
							<ActionPanel>
								<Action
									title="Select"
									icon={Icon.Check}
									onAction={() => handleSelect(currentTime)}
								/>
								<Action.CopyToClipboard
									title="Copy Leave Time"
									content={calculateLeaveTime(
										currentTime,
										workHours,
										breakMins,
									)}
								/>
							</ActionPanel>
						}
					/>
				</List.Section>
			)}

			{/* Custom time (if valid input) */}
			{customTime && !START_TIMES.includes(customTime) && (
				<List.Section title="✏️ Custom Time">
					<List.Item
						title={customTime}
						icon={{ source: Icon.Plus, tintColor: Color.Orange }}
						accessories={[
							{
								text: `→ ${calculateLeaveTime(customTime, workHours, breakMins)}`,
							},
						]}
						actions={
							<ActionPanel>
								<Action
									title="Select"
									icon={Icon.Check}
									onAction={() => handleSelect(customTime)}
								/>
							</ActionPanel>
						}
					/>
				</List.Section>
			)}

			{/* Select start time */}
			<List.Section title="⏰ Select Start Time">
				{filteredTimes.map((time) => {
					const leave = calculateLeaveTime(time, workHours, breakMins);
					const rem = calculateRemainingTime(leave, null);
					const isSelected = time === todayStart;

					return (
						<List.Item
							key={time}
							title={time}
							icon={
								isSelected
									? { source: Icon.CheckCircle, tintColor: Color.Green }
									: Icon.Circle
							}
							accessories={[
								{ text: `→ ${leave}` },
								{
									tag: rem.isPast ? "✓" : `${rem.hours}h ${rem.minutes}m left`,
								},
							]}
							actions={
								<ActionPanel>
									<Action
										title="Select"
										icon={Icon.Check}
										onAction={() => handleSelect(time)}
									/>
									<Action.CopyToClipboard
										title="Copy Leave Time"
										content={leave}
									/>
								</ActionPanel>
							}
						/>
					);
				})}
			</List.Section>
		</List>
	);
}
