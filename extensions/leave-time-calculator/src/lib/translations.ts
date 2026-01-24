import type { Language } from "./types";

export const translations = {
	ja: {
		// Section titles
		todaySection: "📅 今日の予定",
		nowSection: "🚀 今すぐ出勤",
		selectStartSection: "⏰ 出勤時間を選択",
		customTimeSection: "✏️ カスタム時間",

		// Start now
		startNow: (time: string) => `今すぐ (${time})`,

		// Time display
		remaining: (h: number, m: number) => `あと ${h}時間${m}分`,
		overtime: (h: number, m: number) => `${h}時間${m}分 残業中`,
		leaveDisplay: (time: string) => `🏠 ${time} 退勤`,
		startDisplay: (time: string) => `${time}`,
		workBreakTag: (w: number, b: number) => `勤務${w}h 休憩${b}m`,

		// Subtitle (for no-view command)
		leaveLabel: "退勤",
		noStartTimeSet: "出勤時間を設定してください",
		cannotOpenSettings: "設定画面を開けません",

		// Actions
		reset: "リセット",
		select: "選択",
		copyLeaveTime: "退勤時間をコピー",

		// Search
		searchBarPlaceholder: "時間を入力 (例: 9:21)",
	},
	en: {
		// Section titles
		todaySection: "📅 Today",
		nowSection: "🚀 Start Now",
		selectStartSection: "⏰ Select Start Time",
		customTimeSection: "✏️ Custom Time",

		// Start now
		startNow: (time: string) => `Now (${time})`,

		// Time display
		remaining: (h: number, m: number) => `${h}h ${m}m left`,
		overtime: (h: number, m: number) => `${h}h ${m}m overtime`,
		leaveDisplay: (time: string) => `🏠 Leave at ${time}`,
		startDisplay: (time: string) => `${time}`,
		workBreakTag: (w: number, b: number) => `Work ${w}h Break ${b}m`,

		// Subtitle (for no-view command)
		leaveLabel: "leave",
		noStartTimeSet: "Set your start time",
		cannotOpenSettings: "Cannot open settings",

		// Actions
		reset: "Reset",
		select: "Select",
		copyLeaveTime: "Copy Leave Time",

		// Search
		searchBarPlaceholder: "Enter time (e.g., 9:21)",
	},
} as const;

export type Translations = typeof translations.ja;

export function getSystemLanguage(): Language {
	const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
	return systemLocale.startsWith("ja") ? "ja" : "en";
}

export function getLanguage(preference: "system" | "ja" | "en"): Language {
	return preference === "system" ? getSystemLanguage() : preference;
}

export function useTranslations(lang: Language) {
	return translations[lang];
}

// no-view コマンド用の純粋関数（React フック不要）
export function getTranslations(lang: Language) {
	return translations[lang];
}
