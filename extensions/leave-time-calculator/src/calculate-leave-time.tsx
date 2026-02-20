import { type LaunchProps, LaunchType, launchCommand } from "@raycast/api";
import { updateCurrentCommandSubtitle } from "./lib/subtitle";

export default async function Command(props: LaunchProps) {
	await updateCurrentCommandSubtitle();

	if (props.launchType === LaunchType.UserInitiated) {
		await launchCommand({
			name: "calculate-leave-time-view",
			type: LaunchType.UserInitiated,
		});
	}
}
