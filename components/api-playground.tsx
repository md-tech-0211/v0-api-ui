"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Send, ChevronDown, Code2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { JsonViewer } from "@/components/json-viewer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ProtocolList } from "@/components/protocol-list"
import { EligibilityNarrativeView } from "@/components/eligibility-narrative-view"
import { StructuredEligibilityDashboard } from "@/components/structured-eligibility-dashboard"
import { attachLambdaScores, parseEligibilityAnalysisText } from "@/lib/parse-eligibility-analysis"
import { extractBedrockStructuredEnvelope } from "@/lib/structured-eligibility"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

interface ApiResponse {
  status: number
  statusText: string
  data: unknown
  headers: Record<string, string>
  time: number
}

interface ApiError {
  type: "network" | "cors" | "json" | "timeout" | "unknown"
  message: string
}

interface ApiPlaygroundProps {
  defaultEndpoint?: string
}

type PayloadTab = {
  id: string
  label: string
  body: string
}

type BedrockTextAnalysis = {
  text: string
}

export function ApiPlayground({ defaultEndpoint = "" }: ApiPlaygroundProps) {
  const [endpoint, setEndpoint] = useState(defaultEndpoint)
  const [payloadTabs, setPayloadTabs] = useState<PayloadTab[]>([
    {
      id: "patient-1",
      label: "Angelina Reyes",
      body: `{
  "Name": "Incoming form answer",
  "Subitems": null,
  "Submission link": null,
  "Auto number": null,
  "Trigger AI Analysis": "AI Analysis",
  "Staff member conducting pre-screening": "Abbey",
  "AI Analysis": "https://www.app.phases.ai/prescreen/results?candidateId=fd41bef5-d651-4712-94fe-05d29fa84bca",
  "AI Summary": null,
  "Subject's Name": "Angelina Reyes",
  "Pre-Screen Status": "Potentially Eligible/ Needs Review",
  "INTERNAL USE ONLY-Any notes or thoughts about subject. What things may fail them?": null,
  "Which study could the subject possibly meet criteria for?": null,
  "Date of the Call": "2026-04-04T00:00:00",
  "Do we have permission to ask basic medical history questions?": "Yes",
  "Are you representing yourself or someone else?": "Yourself",
  "If representing someone, Describe the Relationship": null,
  "Willing to travel to San Jose clinic?": "Yes",
  "Phone Number": 19165491169,
  "Email Address": "angelinadreyes3@gmail.com",
  "Date of Birth": "2003-11-01T00:00:00",
  "Age": 22,
  "Are you 18 years old or older?": "Yes",
  "What is your ethnicity?": null,
  "Gender / Birth Sex (If they have had sex reassignment surgery, please note below)": "Female",
  "Do you plan to donate sperm within three months following your final study drug administration?": null,
  "Are you Currently pregnant or breastfeeding, or do you plan to become pregnant or to breastfeed in the next year?": "No",
  "Willing to use reliable contraception during study and 90 days after study?": "Yes",
  "Height (rough estimate in in)": 64,
  "Weight (rough estimate in lbs)": 299,
  "BMI": 51.3,
  "City of Residence and Zip Code": null,
  "Best time to reach out": null,
  "How did you hear about this study?": null,
  "Which Social Media Platform.": null,
  "Please specify": null,
  "Do you have any allergies or bad reactions for foods or substances?": "No",
  "What type of allergies or bad reactions for foods or substances?": null,
  "Generalized Allergies → List allergies & reactions": null,
  "Have you had any allergic reactions or negative reactions to prescribed medications, over the counter medications, herbal products or supplements?": "no",
  "What Medication(s) and what type of allergic reaction?": null,
  "Are you currently taking any prescription medication?": "Yes",
  "Please list Each Medications here": "Lexapro 20 mg daily (started 2020); Abilify (dose/frequency not stated); Metformin (dose/frequency not stated)",
  "What medications we haven't already discussed are you currently taking for any health concerns?": null,
  "Are there any medications you CANNOT safely stop?": "NO",
  "List the Medications": null,
  "Would you be willing to temporarily discontinue if required for the study?": "Yes",
  "Have you ever had invasive somatic treatments or received any of the following treatments?": "No",
  "Which treatment did you receive? When did you receive it? What was it for? Was it helpful? (Yes/No/Somewhat)": null,
  "Have you ever had intravenous ketamine?": "No",
  "Have you ever used Esketamine (Spravato)?": "No",
  "Have you used non-invasive somatic treatments including transcranial magnetic stimulation\n(TMS)?": null,
  "Have you had exposure to psilocybin or any other psychedelics in the past? (If yes, then ineligible for COMP)": "Yes",
  "Which one were they have exposure to and when?": "Psilocybin; last use 2025 (last year).",
  "Do you use alcohol?": "Yes",
  "When was your last drink? How frequently do you drink? How much do you usually drink?": "Last drink: Wednesday; frequency: once every 2 months; amount: 2–3 drinks per occasion.",
  "Do you use Marijuana / Cannabis?": "Yes",
  "Is it medically prescribed? When was your last use? How frequently do you Use? How much do you usually Use? Route: Smoking / Edibles / Vaping?": "Not medically prescribed; last use: yesterday.",
  "Has it ever affected work, health, or relationships?": null,
  "Do you recreationally use illegal drugs or other substances?": "Yes",
  "What substance(s) do you use?\nWhen was the last time you used?\nHow frequently do you use drugs?": "Alcohol: once every 2 months (2–3 drinks); last use Wednesday. Marijuana: used yesterday; frequency not specified. Psilocybin: last use 2025. Cocaine: used once in 2022; last use 2022.",
  "Would you be willing to avoid / refrain from cannabis, and all substances during the study period if required?": "Yes",
  "Do you smoke cigarettes or vape?": "Yes",
  "How frequently do you smoke: Daily / Occasionally? How Many per Day? For How many Years? Do you use any nicotine replacement? (patch, gum, pouch)": "Cigarettes daily; at least 4 cigarettes/day; ~3 years; no nicotine replacement.",
  "Please indicate all DIAGNOSED psychiatric conditions reported by subject": "Anxiety/Generalized Anxiety Disorder/GAD, PTSD, x -Other:",
  "Please describe conditions not listed": null,
  "Please indicate all UNDIAGNOSED psychiatric conditions reported by subject": "Social Anxiety Disorder",
  "Would you be willing to sign a medical waiver to talk to your current providers to collect medical\nrecords and/or verify diagnosis?": null,
  "Have you have ever been hospitalized for Mental illness?": null,
  "When? For what reason? How long were you hospitalized?": null,
  "What Medical History do you Have? / Do you have any of the following medical conditions?": "Diabetes",
  "Specify Cancer type:": null,
  "Thyroid Issues: specify": null,
  "Specify, type of Infectious Disease": null,
  "If other, specify conditions not in list": null,
  "If any selected:": null,
  "Have you ever been diagnosed OR had symptoms of ANY mental health condition?": "Major Depressive Disorder/Depression, Bipolar disorder, Anxiety Disorders (Social Anxiety Disorders (SAD) /Generalized anxiety disorder (GAD)), Post-Traumatic Stress Disorder (PTSD) (current or within the past year), Panic Disorder (Hallucinations, Delusions, Paranoia), Sleep disorders",
  "Have you ever been diagnosed with depression?": null,
  "Would you describe your severity rating as mild, moderate, or severe?": "Moderate",
  "Are you currently experiencing depressive symptoms?": "Yes",
  "When do you feel this current episode began?": "Approximately 6 years ago",
  "When was the last time you felt better for at least 2 months?": "Never",
  "Does depression impact your daily functioning?": null,
  "How many episodes have you had in the past 3 years?": null,
  "Have you ever been diagnosed with bipolar disorder?": "Yes",
  "What Type of Bipolar have you had?": "Unsure",
  "Have you ever had manic or hypomanic symptoms?": null,
  "Do you have any of the following symptoms": null,
  "When was your last episode of (hypo)Mania?\n\nHow often do you have (hypo)Mania episodes?\n\nHave you had psychotic features as part of your Bipolar Disorder? (seeing or hearing things, having strange thoughts)": null,
  "How many total episodes lifetime?": null,
  "Are you currently stable or in an active episode?": "Active Episode",
  "Does Bipolar impact your daily functioning?": null,
  "Have you ever been diagnosed with Anxiety Disorder?": "Yes",
  "What Type of Anxiety Disorder have you had?": "Generalized Anxiety Disorder",
  "Does anxiety impact your daily life or functioning?": null,
  "Have you ever been diagnosed with PTSD?": "Yes",
  "What was the trauma related to?": null,
  "When Did it Start?": "2018",
  "Severity scale: How Much you rate yourself- on a scale of 1-10": 5,
  "Are you currently experiencing PTSD symptoms?": "Yes",
  "Please Specify:": "Suicide attempt(s) occurred before the past 12 months (date not provided)",
  "Have you ever been diagnosed with schizophrenia or Other Psychotic Disorder?": "Other Psychotic Disorder",
  "Have you ever experienced any psychotic features?": "hallucination",
  "specify": "Auditory and visual hallucinations",
  "When was your last psychotic symptom?": "Currently active (started 2023)",
  "Have you been diagnosed with a personality disorder?": "No",
  "Which one of the personality disorder are you diagnosed with?": null,
  "Have you ever been diagnosed with any of memory or cognitive disorder?": null,
  "When were you Diagnosed?": null,
  "Would you describe your severity as mild, moderate, or severe?": null,
  "Does this impact your daily life or functioning?": null,
  "Have you been diagnosed with any of Neurodevelopmental Disorder?": null,
  "Current Symptoms?": null,
  "Have you ever been diagnosed with Panic disorder?": "No",
  "Frequency of panic attacks?": null,
  "Have you ever been diagnosed with Obsessive-Compulsive Disorder(OCD)?": "No",
  "Type of compulsions?": null,
  "Have you been diagnosed with an eating disorder (anorexia, bulimia, binge eating)?": "No",
  "Would you describe your eating disorder as mild, moderate, or severe?": null,
  "When was it last active?": null,
  "Have you been diagnosed with migraines OR any other type of headache disorder?": "No",
  "Frequency of migraines per month?": null,
  "When was your last migraine and how often do you get migraines?": null,
  "Have you been diagnosed with a any of the sleep disorder?": "Yes",
  "Which type of sleep disorder?": "Obstructive Sleep apnea",
  "Please Specify?": "Has tried medications and/or psychotherapy for PTSD (not further specified).",
  "Have you ever attempted suicide?": "Yes",
  "Have you had suicidal thoughts in the past 12 months?": null,
  "Are you currently experiencing suicidal thoughts?": null,
  "Are you currently in talk therapy / CBT?": "No",
  "What type of therapy are you doing?": null,
  "Please Specify:If Other": null,
  "How long have you been in therapy?": null,
  "How often are your sessions?": null,
  "Is therapy helping?": null,
  "Any therapy changes in the last 3 months?": null,
  "What changed?": null,
  "Any plans to change therapy soon?": "Plans to start new therapy within the next 3 months (details not provided).",
  "Have you had any surgeries in the past or any planned?": "Yes",
  "Describe each surgery (type + year)?": "Extraction of a pilonidal cyst (2024)",
  "Have you ever participated in a clinical trial/research study in the past?": "Yes",
  "How long ago did you participate?": "Approximately 6 months ago (Oct 2025).",
  "Was it a medication study / Did it involve an investigational drug?": "No",
  "When was your last study participation?": "2025-10-01",
  "Preferred transportation mode": null,
  "Need transportation assistance?": null,
  "Possible screening date": null,
  "Notes": null,
  "Transcript": "https://lumosclinic.monday.com/protected_static/13670031/resources/2877230039/Transcript.txt",
  "Audio Recordings": null,
  "Last Updated": "Abbey Phases Apr 4, 2026 7:02 AM",
  "Pre-screening ID number": null,
  "Have you ever had treatment/Therapy for PTSD Specifically?": "Yes",
  "Item ID (auto generated)": "11672597301"
}`,
    },
    {
      id: "patient-2",
      label: "Sonia White",
      body: `{
  "Name": "Incoming form answer",
  "Subitems": null,
  "Submission link": null,
  "Auto number": null,
  "Trigger AI Analysis": "AI Analysis",
  "Staff member conducting pre-screening": "Abbey",
  "AI Analysis": "https://www.app.phases.ai/prescreen/results?candidateId=03ab9056-c681-4d93-bc33-731ff23ecfe0",
  "AI Summary": null,
  "Subject's Name": "Sonia White",
  "Pre-Screen Status": "Potentially Eligible/ Needs Review",
  "INTERNAL USE ONLY-Any notes or thoughts about subject. What things may fail them?": null,
  "Which study could the subject possibly meet criteria for?": null,
  "Date of the Call": "2026-04-05T00:00:00",
  "Do we have permission to ask basic medical history questions?": "Yes",
  "Are you representing yourself or someone else?": "Yourself",
  "If representing someone, Describe the Relationship": null,
  "Willing to travel to San Jose clinic?": "No",
  "Phone Number": 16024610323,
  "Email Address": "516soniawhite@gmail.com",
  "Date of Birth": "1970-06-20T00:00:00",
  "Age": 56,
  "Are you 18 years old or older?": "Yes",
  "What is your ethnicity?": null,
  "Gender / Birth Sex (If they have had sex reassignment surgery, please note below)": "Female",
  "Do you plan to donate sperm within three months following your final study drug administration?": null,
  "Are you Currently pregnant or breastfeeding, or do you plan to become pregnant or to breastfeed in the next year?": "No",
  "Willing to use reliable contraception during study and 90 days after study?": "Yes",
  "Height (rough estimate in in)": 68,
  "Weight (rough estimate in lbs)": 238,
  "BMI": 36.2,
  "City of Residence and Zip Code": null,
  "Best time to reach out": null,
  "How did you hear about this study?": null,
  "Which Social Media Platform.": null,
  "Please specify": null,
  "Do you have any allergies or bad reactions for foods or substances?": "No",
  "What type of allergies or bad reactions for foods or substances?": null,
  "Generalized Allergies → List allergies & reactions": null,
  "Have you had any allergic reactions or negative reactions to prescribed medications, over the counter medications, herbal products or supplements?": "no",
  "What Medication(s) and what type of allergic reaction?": null,
  "Are you currently taking any prescription medication?": "Yes",
  "Please list Each Medications here": "Generic for Zoloft (sertraline) 100 mg daily; Oxycodone 15 mg four times daily",
  "What medications we haven't already discussed are you currently taking for any health concerns?": null,
  "Are there any medications you CANNOT safely stop?": null,
  "List the Medications": null,
  "Would you be willing to temporarily discontinue if required for the study?": null,
  "Have you ever had invasive somatic treatments or received any of the following treatments?": "No",
  "Which treatment did you receive? When did you receive it? What was it for? Was it helpful? (Yes/No/Somewhat)": null,
  "Have you ever had intravenous ketamine?": "No",
  "Have you ever used Esketamine (Spravato)?": "No",
  "Have you used non-invasive somatic treatments including transcranial magnetic stimulation\n(TMS)?": "No",
  "Have you had exposure to psilocybin or any other psychedelics in the past? (If yes, then ineligible for COMP)": "No",
  "Which one were they have exposure to and when?": null,
  "Do you use alcohol?": "No",
  "When was your last drink? How frequently do you drink? How much do you usually drink?": null,
  "Do you use Marijuana / Cannabis?": "No",
  "Is it medically prescribed? When was your last use? How frequently do you Use? How much do you usually Use? Route: Smoking / Edibles / Vaping?": null,
  "Has it ever affected work, health, or relationships?": null,
  "Do you recreationally use illegal drugs or other substances?": "No",
  "What substance(s) do you use?\nWhen was the last time you used?\nHow frequently do you use drugs?": "Cigarettes; last use: not stated; frequency: 2 cigarettes/day (twice daily).",
  "Would you be willing to avoid / refrain from cannabis, and all substances during the study period if required?": "Yes",
  "Do you smoke cigarettes or vape?": "Yes",
  "How frequently do you smoke: Daily / Occasionally? How Many per Day? For How many Years? Do you use any nicotine replacement? (patch, gum, pouch)": "Cigarettes twice a day; ~2 cigarettes/day; x10 years; no nicotine replacement (no patches/gum/other products).",
  "Please indicate all DIAGNOSED psychiatric conditions reported by subject": "Anxiety/Generalized Anxiety Disorder/GAD, MDD/Depression",
  "Please describe conditions not listed": null,
  "Please indicate all UNDIAGNOSED psychiatric conditions reported by subject": "0 - None reported",
  "Would you be willing to sign a medical waiver to talk to your current providers to collect medical\nrecords and/or verify diagnosis?": null,
  "Have you have ever been hospitalized for Mental illness?": null,
  "When? For what reason? How long were you hospitalized?": null,
  "What Medical History do you Have? / Do you have any of the following medical conditions?": "x -Other:",
  "Specify Cancer type:": null,
  "Thyroid Issues: specify": null,
  "Specify, type of Infectious Disease": null,
  "If other, specify conditions not in list": "Chronic knee pain (needs knee replacement; on oxycodone); Menopause (no periods ≥12 months)",
  "If any selected:": null,
  "Have you ever been diagnosed OR had symptoms of ANY mental health condition?": "Anxiety Disorders (Social Anxiety Disorders (SAD) /Generalized anxiety disorder (GAD)), Major Depressive Disorder/Depression",
  "Have you ever been diagnosed with depression?": "Yes",
  "Would you describe your severity rating as mild, moderate, or severe?": "Moderate",
  "Are you currently experiencing depressive symptoms?": "No",
  "When do you feel this current episode began?": null,
  "When was the last time you felt better for at least 2 months?": null,
  "Does depression impact your daily functioning?": null,
  "How many episodes have you had in the past 3 years?": null,
  "Have you ever been diagnosed with bipolar disorder?": "No",
  "What Type of Bipolar have you had?": null,
  "Have you ever had manic or hypomanic symptoms?": null,
  "Do you have any of the following symptoms": null,
  "When was your last episode of (hypo)Mania?\n\nHow often do you have (hypo)Mania episodes?\n\nHave you had psychotic features as part of your Bipolar Disorder? (seeing or hearing things, having strange thoughts)": null,
  "How many total episodes lifetime?": null,
  "Are you currently stable or in an active episode?": null,
  "Does Bipolar impact your daily functioning?": null,
  "Have you ever been diagnosed with Anxiety Disorder?": "Yes",
  "What Type of Anxiety Disorder have you had?": "Generalized Anxiety Disorder",
  "Does anxiety impact your daily life or functioning?": null,
  "Have you ever been diagnosed with PTSD?": "No",
  "What was the trauma related to?": null,
  "When Did it Start?": null,
  "Severity scale: How Much you rate yourself- on a scale of 1-10": null,
  "Are you currently experiencing PTSD symptoms?": "No",
  "Please Specify:": null,
  "Have you ever been diagnosed with schizophrenia or Other Psychotic Disorder?": "No",
  "Have you ever experienced any psychotic features?": "None of the above",
  "specify": null,
  "When was your last psychotic symptom?": null,
  "Have you been diagnosed with a personality disorder?": null,
  "Which one of the personality disorder are you diagnosed with?": null,
  "Have you ever been diagnosed with any of memory or cognitive disorder?": null,
  "When were you Diagnosed?": null,
  "Would you describe your severity as mild, moderate, or severe?": "Moderate",
  "Does this impact your daily life or functioning?": null,
  "Have you been diagnosed with any of Neurodevelopmental Disorder?": null,
  "Current Symptoms?": "Generalized anxiety (moderate, currently active); depression history (severe, currently not feeling depressed); chronic knee pain/needs knee replacement (uses oxycodone); menopausal (no periods ≥12 months).",
  "Have you ever been diagnosed with Panic disorder?": "No",
  "Frequency of panic attacks?": null,
  "Have you ever been diagnosed with Obsessive-Compulsive Disorder(OCD)?": "No",
  "Type of compulsions?": null,
  "Have you been diagnosed with an eating disorder (anorexia, bulimia, binge eating)?": "No",
  "Would you describe your eating disorder as mild, moderate, or severe?": null,
  "When was it last active?": null,
  "Have you been diagnosed with migraines OR any other type of headache disorder?": "No",
  "Frequency of migraines per month?": null,
  "When was your last migraine and how often do you get migraines?": null,
  "Have you been diagnosed with a any of the sleep disorder?": "No",
  "Which type of sleep disorder?": null,
  "Please Specify?": null,
  "Have you ever attempted suicide?": "No",
  "Have you had suicidal thoughts in the past 12 months?": "No",
  "Are you currently experiencing suicidal thoughts?": "No",
  "Are you currently in talk therapy / CBT?": "No",
  "What type of therapy are you doing?": null,
  "Please Specify:If Other": null,
  "How long have you been in therapy?": null,
  "How often are your sessions?": null,
  "Is therapy helping?": null,
  "Any therapy changes in the last 3 months?": null,
  "What changed?": null,
  "Any plans to change therapy soon?": "No plans to start a new therapy in the next 3 months",
  "Have you had any surgeries in the past or any planned?": "No",
  "Describe each surgery (type + year)?": null,
  "Have you ever participated in a clinical trial/research study in the past?": "Yes",
  "How long ago did you participate?": "Most recent participation: 2026-02",
  "Was it a medication study / Did it involve an investigational drug?": "No",
  "When was your last study participation?": "2026-02-01",
  "Preferred transportation mode": null,
  "Need transportation assistance?": null,
  "Possible screening date": null,
  "Notes": null,
  "Transcript": "https://lumosclinic.monday.com/protected_static/13670031/resources/2878192097/Transcript.txt",
  "Audio Recordings": "https://lumosclinic.monday.com/protected_static/13670031/resources/2878192127/Audio_1.mp3",
  "Last Updated": "Abbey Phases Apr 6, 2026 1:44 AM",
  "Pre-screening ID number": null,
  "Have you ever had treatment/Therapy for PTSD Specifically?": null,
  "Item ID (auto generated)": "11675858574"
}`,
    },
    {
      id: "patient-3",
      label: "Traci Hagedorn",
      body: `{
  "Name": "Incoming form answer",
  "Subitems": null,
  "Submission link": null,
  "Auto number": null,
  "Trigger AI Analysis": "AI Analysis",
  "Staff member conducting pre-screening": "Abbey",
  "AI Analysis": "https://www.app.phases.ai/prescreen/results?candidateId=3392887d-fbb9-4591-b8f0-eff63089845d",
  "AI Summary": null,
  "Subject's Name": "Traci Hagedorn",
  "Pre-Screen Status": "Potentially Eligible/ Needs Review",
  "INTERNAL USE ONLY-Any notes or thoughts about subject. What things may fail them?": null,
  "Which study could the subject possibly meet criteria for?": null,
  "Date of the Call": "2026-04-05T00:00:00",
  "Do we have permission to ask basic medical history questions?": "Yes",
  "Are you representing yourself or someone else?": "Yourself",
  "If representing someone, Describe the Relationship": null,
  "Willing to travel to San Jose clinic?": "Yes",
  "Phone Number": 16692357876,
  "Email Address": "cecilb@gmail.com",
  "Date of Birth": "1985-11-05T00:00:00",
  "Age": 40,
  "Are you 18 years old or older?": "Yes",
  "What is your ethnicity?": null,
  "Gender / Birth Sex (If they have had sex reassignment surgery, please note below)": "Female",
  "Do you plan to donate sperm within three months following your final study drug administration?": null,
  "Are you Currently pregnant or breastfeeding, or do you plan to become pregnant or to breastfeed in the next year?": null,
  "Willing to use reliable contraception during study and 90 days after study?": "Yes",
  "Height (rough estimate in in)": 67.5,
  "Weight (rough estimate in lbs)": 207,
  "BMI": 31.9,
  "City of Residence and Zip Code": null,
  "Best time to reach out": null,
  "How did you hear about this study?": null,
  "Which Social Media Platform.": null,
  "Please specify": null,
  "Do you have any allergies or bad reactions for foods or substances?": "Yes",
  "What type of allergies or bad reactions for foods or substances?": "Medication related Allergies/Bad reactions",
  "Generalized Allergies → List allergies & reactions": null,
  "Have you had any allergic reactions or negative reactions to prescribed medications, over the counter medications, herbal products or supplements?": "yes",
  "What Medication(s) and what type of allergic reaction?": "Benazapril (reaction not specified)",
  "Are you currently taking any prescription medication?": "Yes",
  "Please list Each Medications here": "Losartan/HCTZ (combo pill) 100 mg/25 mg once daily; Rosuvastatin 10 mg once daily; Humalog insulin (~22 units with meals; smaller correction doses; ~4–5x/day)",
  "What medications we haven't already discussed are you currently taking for any health concerns?": null,
  "Are there any medications you CANNOT safely stop?": "YES",
  "List the Medications": "Humalog insulin",
  "Would you be willing to temporarily discontinue if required for the study?": "No",
  "Have you ever had invasive somatic treatments or received any of the following treatments?": "No",
  "Which treatment did you receive? When did you receive it? What was it for? Was it helpful? (Yes/No/Somewhat)": null,
  "Have you ever had intravenous ketamine?": "No",
  "Have you ever used Esketamine (Spravato)?": "No",
  "Have you used non-invasive somatic treatments including transcranial magnetic stimulation\n(TMS)?": null,
  "Have you had exposure to psilocybin or any other psychedelics in the past? (If yes, then ineligible for COMP)": null,
  "Which one were they have exposure to and when?": null,
  "Do you use alcohol?": "Yes",
  "When was your last drink? How frequently do you drink? How much do you usually drink?": "Last drink: February 23 (year not specified). Frequency: ~1 beer every 2 months; ~1 rum/vodka drink about monthly. Typical amount: 2 drinks per occasion.",
  "Do you use Marijuana / Cannabis?": null,
  "Is it medically prescribed? When was your last use? How frequently do you Use? How much do you usually Use? Route: Smoking / Edibles / Vaping?": null,
  "Has it ever affected work, health, or relationships?": "No",
  "Do you recreationally use illegal drugs or other substances?": "No",
  "What substance(s) do you use?\nWhen was the last time you used?\nHow frequently do you use drugs?": "Alcohol: last drink February 23 (year not specified); ~1 beer every 2 months and ~1 rum/vodka drink about monthly; typically 2 drinks per occasion. Denies illicit drug use.",
  "Would you be willing to avoid / refrain from cannabis, and all substances during the study period if required?": "Yes",
  "Do you smoke cigarettes or vape?": "No",
  "How frequently do you smoke: Daily / Occasionally? How Many per Day? For How many Years? Do you use any nicotine replacement? (patch, gum, pouch)": null,
  "Please indicate all DIAGNOSED psychiatric conditions reported by subject": "0 - None reported",
  "Please describe conditions not listed": "Insomnia symptoms (no formal diagnosis); believes she has OCD but not formally diagnosed.",
  "Please indicate all UNDIAGNOSED psychiatric conditions reported by subject": "Anxiety/Generalized Anxiety Disorder/GAD, MDD/Depression, OCD",
  "Would you be willing to sign a medical waiver to talk to your current providers to collect medical\nrecords and/or verify diagnosis?": null,
  "Have you have ever been hospitalized for Mental illness?": null,
  "When? For what reason? How long were you hospitalized?": null,
  "What Medical History do you Have? / Do you have any of the following medical conditions?": "Allergies, Diabetes, High/Low Blood Pressure / Hypertension",
  "Specify Cancer type:": null,
  "Thyroid Issues: specify": null,
  "Specify, type of Infectious Disease": null,
  "If other, specify conditions not in list": null,
  "If any selected:": null,
  "Have you ever been diagnosed OR had symptoms of ANY mental health condition?": "Major Depressive Disorder/Depression, Anxiety Disorders (Social Anxiety Disorders (SAD) /Generalized anxiety disorder (GAD)), Obsessive Compulsive Disorder (OCD), Sleep disorders, Migraine",
  "Have you ever been diagnosed with depression?": "No",
  "Would you describe your severity rating as mild, moderate, or severe?": "Mild",
  "Are you currently experiencing depressive symptoms?": "No",
  "When do you feel this current episode began?": null,
  "When was the last time you felt better for at least 2 months?": null,
  "Does depression impact your daily functioning?": null,
  "How many episodes have you had in the past 3 years?": null,
  "Have you ever been diagnosed with bipolar disorder?": "No",
  "What Type of Bipolar have you had?": null,
  "Have you ever had manic or hypomanic symptoms?": null,
  "Do you have any of the following symptoms": null,
  "When was your last episode of (hypo)Mania?\n\nHow often do you have (hypo)Mania episodes?\n\nHave you had psychotic features as part of your Bipolar Disorder? (seeing or hearing things, having strange thoughts)": null,
  "How many total episodes lifetime?": null,
  "Are you currently stable or in an active episode?": null,
  "Does Bipolar impact your daily functioning?": null,
  "Have you ever been diagnosed with Anxiety Disorder?": "No",
  "What Type of Anxiety Disorder have you had?": "Generalized Anxiety Disorder",
  "Does anxiety impact your daily life or functioning?": null,
  "Have you ever been diagnosed with PTSD?": "No",
  "What was the trauma related to?": null,
  "When Did it Start?": null,
  "Severity scale: How Much you rate yourself- on a scale of 1-10": null,
  "Are you currently experiencing PTSD symptoms?": "No",
  "Please Specify:": null,
  "Have you ever been diagnosed with schizophrenia or Other Psychotic Disorder?": "No",
  "Have you ever experienced any psychotic features?": "None of the above",
  "specify": null,
  "When was your last psychotic symptom?": null,
  "Have you been diagnosed with a personality disorder?": null,
  "Which one of the personality disorder are you diagnosed with?": null,
  "Have you ever been diagnosed with any of memory or cognitive disorder?": null,
  "When were you Diagnosed?": null,
  "Would you describe your severity as mild, moderate, or severe?": "Moderate",
  "Does this impact your daily life or functioning?": null,
  "Have you been diagnosed with any of Neurodevelopmental Disorder?": null,
  "Current Symptoms?": "Generalized anxiety (mild; not formally diagnosed); depression (moderate; episodic; not currently depressed; not formally diagnosed); insomnia symptoms (difficulty sleeping; uses non-prescription sleep aid; no formal diagnosis); self-reported obsessive-compulsive symptoms (no formal OCD diagnosis); migraines (rare; intense head pain with light and sound sensitivity).",
  "Have you ever been diagnosed with Panic disorder?": null,
  "Frequency of panic attacks?": null,
  "Have you ever been diagnosed with Obsessive-Compulsive Disorder(OCD)?": "No",
  "Type of compulsions?": null,
  "Have you been diagnosed with an eating disorder (anorexia, bulimia, binge eating)?": "No",
  "Would you describe your eating disorder as mild, moderate, or severe?": null,
  "When was it last active?": null,
  "Have you been diagnosed with migraines OR any other type of headache disorder?": "Yes",
  "Frequency of migraines per month?": null,
  "When was your last migraine and how often do you get migraines?": "Rarely; last migraine not specified",
  "Have you been diagnosed with a any of the sleep disorder?": "No",
  "Which type of sleep disorder?": null,
  "Please Specify?": null,
  "Have you ever attempted suicide?": "No",
  "Have you had suicidal thoughts in the past 12 months?": "Yes",
  "Are you currently experiencing suicidal thoughts?": null,
  "Are you currently in talk therapy / CBT?": "No",
  "What type of therapy are you doing?": null,
  "Please Specify:If Other": null,
  "How long have you been in therapy?": null,
  "How often are your sessions?": null,
  "Is therapy helping?": null,
  "Any therapy changes in the last 3 months?": null,
  "What changed?": null,
  "Any plans to change therapy soon?": "No plans to start new therapy in the next 3 months.",
  "Have you had any surgeries in the past or any planned?": "Yes",
  "Describe each surgery (type + year)?": "Hernia surgery (childhood) - 1986; Strabismus correction surgery - 1990; Strabismus correction surgery (high school) - year not provided.",
  "Have you ever participated in a clinical trial/research study in the past?": "Yes",
  "How long ago did you participate?": "~1 year ago (2025).",
  "Was it a medication study / Did it involve an investigational drug?": "No",
  "When was your last study participation?": "2025-03-01",
  "Preferred transportation mode": null,
  "Need transportation assistance?": null,
  "Possible screening date": null,
  "Notes": null,
  "Transcript": "https://lumosclinic.monday.com/protected_static/13670031/resources/2878194139/Transcript.txt",
  "Audio Recordings": "https://lumosclinic.monday.com/protected_static/13670031/resources/2878194148/Audio_1.mp3",
  "Last Updated": "Abbey Phases Apr 6, 2026 1:52 AM",
  "Pre-screening ID number": null,
  "Have you ever had treatment/Therapy for PTSD Specifically?": null,
  "Item ID (auto generated)": "11675867556"
}`,
    },
    {
      id: "patient-4",
      label: "Nina Saleh",
      body: `{
  "Name": "Incoming form answer",
  "Subitems": null,
  "Submission link": null,
  "Auto number": null,
  "Trigger AI Analysis": "AI Analysis",
  "Staff member conducting pre-screening": "Abbey",
  "AI Analysis": "https://www.app.phases.ai/prescreen/results?candidateId=e18db4b8-4d78-4f27-b070-1fec891b0229",
  "AI Summary": null,
  "Subject's Name": "Nina Saleh",
  "Pre-Screen Status": "Potentially Eligible/ Needs Review",
  "INTERNAL USE ONLY-Any notes or thoughts about subject. What things may fail them?": null,
  "Which study could the subject possibly meet criteria for?": null,
  "Date of the Call": "2026-04-06T00:00:00",
  "Do we have permission to ask basic medical history questions?": "Yes",
  "Are you representing yourself or someone else?": "Yourself",
  "If representing someone, Describe the Relationship": null,
  "Willing to travel to San Jose clinic?": "Yes",
  "Phone Number": 19259220703,
  "Email Address": "nsaleh91@gmail.com",
  "Date of Birth": "1991-04-19T00:00:00",
  "Age": 35,
  "Are you 18 years old or older?": "Yes",
  "What is your ethnicity?": null,
  "Gender / Birth Sex (If they have had sex reassignment surgery, please note below)": "Female",
  "Do you plan to donate sperm within three months following your final study drug administration?": null,
  "Are you Currently pregnant or breastfeeding, or do you plan to become pregnant or to breastfeed in the next year?": "No",
  "Willing to use reliable contraception during study and 90 days after study?": "Yes",
  "Height (rough estimate in in)": 64,
  "Weight (rough estimate in lbs)": 142,
  "BMI": 24.4,
  "City of Residence and Zip Code": null,
  "Best time to reach out": "Prefers text communication",
  "How did you hear about this study?": null,
  "Which Social Media Platform.": null,
  "Please specify": null,
  "Do you have any allergies or bad reactions for foods or substances?": "No",
  "What type of allergies or bad reactions for foods or substances?": null,
  "Generalized Allergies → List allergies & reactions": null,
  "Have you had any allergic reactions or negative reactions to prescribed medications, over the counter medications, herbal products or supplements?": "no",
  "What Medication(s) and what type of allergic reaction?": null,
  "Are you currently taking any prescription medication?": "Yes",
  "Please list Each Medications here": "Ritalin 5 mg almost daily; Zyrtec once daily (dose unknown)",
  "What medications we haven't already discussed are you currently taking for any health concerns?": null,
  "Are there any medications you CANNOT safely stop?": "NO",
  "List the Medications": null,
  "Would you be willing to temporarily discontinue if required for the study?": "Yes",
  "Have you ever had invasive somatic treatments or received any of the following treatments?": "No",
  "Which treatment did you receive? When did you receive it? What was it for? Was it helpful? (Yes/No/Somewhat)": null,
  "Have you ever had intravenous ketamine?": "No",
  "Have you ever used Esketamine (Spravato)?": "No",
  "Have you used non-invasive somatic treatments including transcranial magnetic stimulation\n(TMS)?": null,
  "Have you had exposure to psilocybin or any other psychedelics in the past? (If yes, then ineligible for COMP)": null,
  "Which one were they have exposure to and when?": null,
  "Do you use alcohol?": "Yes",
  "When was your last drink? How frequently do you drink? How much do you usually drink?": "Last drink: 10 days ago. Frequency: once or twice a month. Amount: typically 2 glasses of wine per occasion.",
  "Do you use Marijuana / Cannabis?": null,
  "Is it medically prescribed? When was your last use? How frequently do you Use? How much do you usually Use? Route: Smoking / Edibles / Vaping?": null,
  "Has it ever affected work, health, or relationships?": "No",
  "Do you recreationally use illegal drugs or other substances?": "No",
  "What substance(s) do you use?\nWhen was the last time you used?\nHow frequently do you use drugs?": "Alcohol: last use 10 days ago; drinks once or twice a month (typically 2 glasses of wine). Denies illicit substance use.",
  "Would you be willing to avoid / refrain from cannabis, and all substances during the study period if required?": "Yes",
  "Do you smoke cigarettes or vape?": "No",
  "How frequently do you smoke: Daily / Occasionally? How Many per Day? For How many Years? Do you use any nicotine replacement? (patch, gum, pouch)": null,
  "Please indicate all DIAGNOSED psychiatric conditions reported by subject": "ADHD",
  "Please describe conditions not listed": null,
  "Please indicate all UNDIAGNOSED psychiatric conditions reported by subject": "0 - None reported",
  "Would you be willing to sign a medical waiver to talk to your current providers to collect medical\nrecords and/or verify diagnosis?": null,
  "Have you have ever been hospitalized for Mental illness?": "No",
  "When? For what reason? How long were you hospitalized?": null,
  "What Medical History do you Have? / Do you have any of the following medical conditions?": "Allergies",
  "Specify Cancer type:": null,
  "Thyroid Issues: specify": null,
  "Specify, type of Infectious Disease": null,
  "If other, specify conditions not in list": null,
  "If any selected:": null,
  "Have you ever been diagnosed OR had symptoms of ANY mental health condition?": "Attention deficit hyperactivity disorder (ADHD/Autism) (currently being treated), Sleep disorders",
  "Have you ever been diagnosed with depression?": "No",
  "Would you describe your severity rating as mild, moderate, or severe?": null,
  "Are you currently experiencing depressive symptoms?": null,
  "When do you feel this current episode began?": null,
  "When was the last time you felt better for at least 2 months?": null,
  "Does depression impact your daily functioning?": null,
  "How many episodes have you had in the past 3 years?": null,
  "Have you ever been diagnosed with bipolar disorder?": "No",
  "What Type of Bipolar have you had?": null,
  "Have you ever had manic or hypomanic symptoms?": null,
  "Do you have any of the following symptoms": null,
  "When was your last episode of (hypo)Mania?\n\nHow often do you have (hypo)Mania episodes?\n\nHave you had psychotic features as part of your Bipolar Disorder? (seeing or hearing things, having strange thoughts)": null,
  "How many total episodes lifetime?": null,
  "Are you currently stable or in an active episode?": null,
  "Does Bipolar impact your daily functioning?": null,
  "Have you ever been diagnosed with Anxiety Disorder?": "No",
  "What Type of Anxiety Disorder have you had?": null,
  "Does anxiety impact your daily life or functioning?": null,
  "Have you ever been diagnosed with PTSD?": "No",
  "What was the trauma related to?": null,
  "When Did it Start?": null,
  "Severity scale: How Much you rate yourself- on a scale of 1-10": null,
  "Are you currently experiencing PTSD symptoms?": "No",
  "Please Specify:": null,
  "Have you ever been diagnosed with schizophrenia or Other Psychotic Disorder?": "No",
  "Have you ever experienced any psychotic features?": "None of the above",
  "specify": null,
  "When was your last psychotic symptom?": null,
  "Have you been diagnosed with a personality disorder?": null,
  "Which one of the personality disorder are you diagnosed with?": null,
  "Have you ever been diagnosed with any of memory or cognitive disorder?": null,
  "When were you Diagnosed?": null,
  "Would you describe your severity as mild, moderate, or severe?": "Moderate",
  "Does this impact your daily life or functioning?": null,
  "Have you been diagnosed with any of Neurodevelopmental Disorder?": "Attention-deficit/ hyperactive Disorder (ADHD)",
  "Current Symptoms?": "Forgetfulness; difficulty starting projects; difficulty concentrating; loss of time with “frozen” executive function; hyperfixation",
  "Have you ever been diagnosed with Panic disorder?": "No",
  "Frequency of panic attacks?": null,
  "Have you ever been diagnosed with Obsessive-Compulsive Disorder(OCD)?": "No",
  "Type of compulsions?": null,
  "Have you been diagnosed with an eating disorder (anorexia, bulimia, binge eating)?": "No",
  "Would you describe your eating disorder as mild, moderate, or severe?": null,
  "When was it last active?": null,
  "Have you been diagnosed with migraines OR any other type of headache disorder?": "No",
  "Frequency of migraines per month?": null,
  "When was your last migraine and how often do you get migraines?": null,
  "Have you been diagnosed with a any of the sleep disorder?": "No",
  "Which type of sleep disorder?": null,
  "Please Specify?": null,
  "Have you ever attempted suicide?": "No",
  "Have you had suicidal thoughts in the past 12 months?": "No",
  "Are you currently experiencing suicidal thoughts?": "No",
  "Are you currently in talk therapy / CBT?": "Yes",
  "What type of therapy are you doing?": "Cognitive Behavioral Therapy (CBT), Talk Therapy",
  "Please Specify:If Other": null,
  "How long have you been in therapy?": "Since January (year not stated)",
  "How often are your sessions?": "Weekly",
  "Is therapy helping?": null,
  "Any therapy changes in the last 3 months?": "No",
  "What changed?": null,
  "Any plans to change therapy soon?": "Currently weekly; might change to bi-weekly (within next 3 months).",
  "Have you had any surgeries in the past or any planned?": "Yes",
  "Describe each surgery (type + year)?": "Bunion surgery (~8–10 years ago); deviated septum surgery (~3 years ago).",
  "Have you ever participated in a clinical trial/research study in the past?": "No",
  "How long ago did you participate?": null,
  "Was it a medication study / Did it involve an investigational drug?": null,
  "When was your last study participation?": null,
  "Preferred transportation mode": null,
  "Need transportation assistance?": null,
  "Possible screening date": null,
  "Notes": null,
  "Transcript": "https://lumosclinic.monday.com/protected_static/13670031/resources/2878272622/Transcript.txt",
  "Audio Recordings": null,
  "Last Updated": "Abbey Phases Apr 6, 2026 6:34 AM",
  "Pre-screening ID number": null,
  "Have you ever had treatment/Therapy for PTSD Specifically?": null,
  "Item ID (auto generated)": "11676419887"
}`,
    },
    {
      id: "patient-5",
      label: "Chia Pac",
      body: `{
  "Name": "Incoming form answer",
  "Subitems": null,
  "Submission link": null,
  "Auto number": null,
  "Trigger AI Analysis": "AI Analysis",
  "Staff member conducting pre-screening": "Abbey",
  "AI Analysis": "https://www.app.phases.ai/prescreen/results?candidateId=3a6940c0-43d3-4533-87ce-727d682c69c3",
  "AI Summary": null,
  "Subject's Name": "Chia Pac",
  "Pre-Screen Status": "Potentially Eligible/ Needs Review",
  "INTERNAL USE ONLY-Any notes or thoughts about subject. What things may fail them?": null,
  "Which study could the subject possibly meet criteria for?": null,
  "Date of the Call": "2026-04-06T00:00:00",
  "Do we have permission to ask basic medical history questions?": "Yes",
  "Are you representing yourself or someone else?": "Yourself",
  "If representing someone, Describe the Relationship": null,
  "Willing to travel to San Jose clinic?": "Yes",
  "Phone Number": 19495290863,
  "Email Address": "novpac@gmail.com",
  "Date of Birth": "1984-11-16T00:00:00",
  "Age": 41,
  "Are you 18 years old or older?": "Yes",
  "What is your ethnicity?": null,
  "Gender / Birth Sex (If they have had sex reassignment surgery, please note below)": "Male",
  "Do you plan to donate sperm within three months following your final study drug administration?": "No",
  "Are you Currently pregnant or breastfeeding, or do you plan to become pregnant or to breastfeed in the next year?": null,
  "Willing to use reliable contraception during study and 90 days after study?": "Yes",
  "Height (rough estimate in in)": 71,
  "Weight (rough estimate in lbs)": 215,
  "BMI": 30,
  "City of Residence and Zip Code": null,
  "Best time to reach out": null,
  "How did you hear about this study?": null,
  "Which Social Media Platform.": null,
  "Please specify": null,
  "Do you have any allergies or bad reactions for foods or substances?": "No",
  "What type of allergies or bad reactions for foods or substances?": null,
  "Generalized Allergies → List allergies & reactions": null,
  "Have you had any allergic reactions or negative reactions to prescribed medications, over the counter medications, herbal products or supplements?": "no",
  "What Medication(s) and what type of allergic reaction?": null,
  "Are you currently taking any prescription medication?": "No",
  "Please list Each Medications here": null,
  "What medications we haven't already discussed are you currently taking for any health concerns?": "Supplements: fish oil, probiotic, multivitamin, lutein",
  "Are there any medications you CANNOT safely stop?": "NO",
  "List the Medications": null,
  "Would you be willing to temporarily discontinue if required for the study?": "Yes",
  "Have you ever had invasive somatic treatments or received any of the following treatments?": "No",
  "Which treatment did you receive? When did you receive it? What was it for? Was it helpful? (Yes/No/Somewhat)": null,
  "Have you ever had intravenous ketamine?": "No",
  "Have you ever used Esketamine (Spravato)?": "No",
  "Have you used non-invasive somatic treatments including transcranial magnetic stimulation\n(TMS)?": null,
  "Have you had exposure to psilocybin or any other psychedelics in the past? (If yes, then ineligible for COMP)": null,
  "Which one were they have exposure to and when?": null,
  "Do you use alcohol?": "Yes",
  "When was your last drink? How frequently do you drink? How much do you usually drink?": "Last drink: last week. Frequency: once a week. Typical amount: one glass.",
  "Do you use Marijuana / Cannabis?": null,
  "Is it medically prescribed? When was your last use? How frequently do you Use? How much do you usually Use? Route: Smoking / Edibles / Vaping?": null,
  "Has it ever affected work, health, or relationships?": "No",
  "Do you recreationally use illegal drugs or other substances?": "No",
  "What substance(s) do you use?\nWhen was the last time you used?\nHow frequently do you use drugs?": "Alcohol: last use last week; drinks once/week; typically 1 glass per occasion. No cannabis or illicit substance use reported.",
  "Would you be willing to avoid / refrain from cannabis, and all substances during the study period if required?": "Yes",
  "Do you smoke cigarettes or vape?": "No",
  "How frequently do you smoke: Daily / Occasionally? How Many per Day? For How many Years? Do you use any nicotine replacement? (patch, gum, pouch)": null,
  "Please indicate all DIAGNOSED psychiatric conditions reported by subject": "0 - None reported",
  "Please describe conditions not listed": null,
  "Please indicate all UNDIAGNOSED psychiatric conditions reported by subject": "Anxiety/Generalized Anxiety Disorder/GAD, MDD/Depression",
  "Would you be willing to sign a medical waiver to talk to your current providers to collect medical\nrecords and/or verify diagnosis?": null,
  "Have you have ever been hospitalized for Mental illness?": null,
  "When? For what reason? How long were you hospitalized?": null,
  "What Medical History do you Have? / Do you have any of the following medical conditions?": "0- None reported",
  "Specify Cancer type:": null,
  "Thyroid Issues: specify": null,
  "Specify, type of Infectious Disease": null,
  "If other, specify conditions not in list": null,
  "If any selected:": null,
  "Have you ever been diagnosed OR had symptoms of ANY mental health condition?": "Anxiety Disorders (Social Anxiety Disorders (SAD) /Generalized anxiety disorder (GAD)), Major Depressive Disorder/Depression, Sleep disorders",
  "Have you ever been diagnosed with depression?": "No",
  "Would you describe your severity rating as mild, moderate, or severe?": "Mild",
  "Are you currently experiencing depressive symptoms?": "Yes",
  "When do you feel this current episode began?": "A little over 1 month ago",
  "When was the last time you felt better for at least 2 months?": null,
  "Does depression impact your daily functioning?": null,
  "How many episodes have you had in the past 3 years?": 4,
  "Have you ever been diagnosed with bipolar disorder?": "No",
  "What Type of Bipolar have you had?": null,
  "Have you ever had manic or hypomanic symptoms?": null,
  "Do you have any of the following symptoms": null,
  "When was your last episode of (hypo)Mania?\n\nHow often do you have (hypo)Mania episodes?\n\nHave you had psychotic features as part of your Bipolar Disorder? (seeing or hearing things, having strange thoughts)": null,
  "How many total episodes lifetime?": null,
  "Are you currently stable or in an active episode?": null,
  "Does Bipolar impact your daily functioning?": null,
  "Have you ever been diagnosed with Anxiety Disorder?": "No",
  "What Type of Anxiety Disorder have you had?": "Generalized Anxiety Disorder",
  "Does anxiety impact your daily life or functioning?": null,
  "Have you ever been diagnosed with PTSD?": "No",
  "What was the trauma related to?": null,
  "When Did it Start?": null,
  "Severity scale: How Much you rate yourself- on a scale of 1-10": null,
  "Are you currently experiencing PTSD symptoms?": "No",
  "Please Specify:": null,
  "Have you ever been diagnosed with schizophrenia or Other Psychotic Disorder?": "No",
  "Have you ever experienced any psychotic features?": "None of the above",
  "specify": null,
  "When was your last psychotic symptom?": null,
  "Have you been diagnosed with a personality disorder?": "No",
  "Which one of the personality disorder are you diagnosed with?": null,
  "Have you ever been diagnosed with any of memory or cognitive disorder?": null,
  "When were you Diagnosed?": null,
  "Would you describe your severity as mild, moderate, or severe?": null,
  "Does this impact your daily life or functioning?": null,
  "Have you been diagnosed with any of Neurodevelopmental Disorder?": null,
  "Current Symptoms?": null,
  "Have you ever been diagnosed with Panic disorder?": "No",
  "Frequency of panic attacks?": null,
  "Have you ever been diagnosed with Obsessive-Compulsive Disorder(OCD)?": "No",
  "Type of compulsions?": null,
  "Have you been diagnosed with an eating disorder (anorexia, bulimia, binge eating)?": "No",
  "Would you describe your eating disorder as mild, moderate, or severe?": null,
  "When was it last active?": null,
  "Have you been diagnosed with migraines OR any other type of headache disorder?": "No",
  "Frequency of migraines per month?": null,
  "When was your last migraine and how often do you get migraines?": null,
  "Have you been diagnosed with a any of the sleep disorder?": "Yes",
  "Which type of sleep disorder?": "Obstructive Sleep apnea",
  "Please Specify?": null,
  "Have you ever attempted suicide?": "No",
  "Have you had suicidal thoughts in the past 12 months?": "No",
  "Are you currently experiencing suicidal thoughts?": "No",
  "Are you currently in talk therapy / CBT?": "No",
  "What type of therapy are you doing?": null,
  "Please Specify:If Other": null,
  "How long have you been in therapy?": null,
  "How often are your sessions?": null,
  "Is therapy helping?": null,
  "Any therapy changes in the last 3 months?": "No",
  "What changed?": null,
  "Any plans to change therapy soon?": "No plans to start therapy in the next 3 months",
  "Have you had any surgeries in the past or any planned?": "No",
  "Describe each surgery (type + year)?": null,
  "Have you ever participated in a clinical trial/research study in the past?": "No",
  "How long ago did you participate?": null,
  "Was it a medication study / Did it involve an investigational drug?": null,
  "When was your last study participation?": null,
  "Preferred transportation mode": null,
  "Need transportation assistance?": null,
  "Possible screening date": null,
  "Notes": null,
  "Transcript": "https://lumosclinic.monday.com/protected_static/13670031/resources/2878397081/Transcript.txt",
  "Audio Recordings": null,
  "Last Updated": "Abbey Phases Apr 6, 2026 11:03 AM",
  "Pre-screening ID number": null,
  "Have you ever had treatment/Therapy for PTSD Specifically?": null,
  "Item ID (auto generated)": "11676990209"
}`,
    },
  ])
  const [activePayloadTabId, setActivePayloadTabId] = useState<string>("patient-1")
  const [method, setMethod] = useState<HttpMethod>("GET")
  const [isLoading, setIsLoading] = useState(false)
  const [responsesByTabId, setResponsesByTabId] = useState<Record<string, ApiResponse | null>>({
    "patient-1": null,
    "patient-2": null,
    "patient-3": null,
    "patient-4": null,
    "patient-5": null,
  })
  const [errorsByTabId, setErrorsByTabId] = useState<Record<string, ApiError | null>>({
    "patient-1": null,
    "patient-2": null,
    "patient-3": null,
    "patient-4": null,
    "patient-5": null,
  })
  const [isMethodOpen, setIsMethodOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Check if response contains protocol evaluation data
  const isProtocolResponse = useCallback((data: unknown): data is { protocols_evaluated: Array<{ protocol_id: string; eligible: boolean; score: number; matched_criteria: string[]; failed_criteria: string[] }> } => {
    if (!data || typeof data !== "object") return false
    const obj = data as Record<string, unknown>
    if (!Array.isArray(obj.protocols_evaluated)) return false
    const protocols = obj.protocols_evaluated
    if (protocols.length === 0) return false
    const first = protocols[0]
    return (
      typeof first === "object" &&
      first !== null &&
      "protocol_id" in first &&
      "eligible" in first &&
      "score" in first
    )
  }, [])
  const methodDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target as Node)) {
        setIsMethodOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const activeResponse = responsesByTabId[activePayloadTabId] ?? null
  const activeError = errorsByTabId[activePayloadTabId] ?? null

  const narrativeFromAnalysis = useMemo(() => {
    const data = activeResponse?.data
    if (!data || typeof data !== "object") return null
    const d = data as { analysis?: { text?: string }; lambdaOutput?: unknown }
    const text = d.analysis?.text
    if (typeof text !== "string" || !text.trim()) return null
    const parsed = parseEligibilityAnalysisText(text)
    if (parsed.protocols.length === 0) return null
    return {
      patient: parsed.patient,
      rows: attachLambdaScores(parsed.protocols, d.lambdaOutput ?? null),
    }
  }, [activeResponse])

  const structuredEnvelope = useMemo(
    () => (activeResponse?.data ? extractBedrockStructuredEnvelope(activeResponse.data) : null),
    [activeResponse]
  )

  const analyzePatientLabel = useMemo(() => {
    const data = activeResponse?.data
    if (!data || typeof data !== "object") return undefined
    const p = (data as Record<string, unknown>).patient
    return typeof p === "string" && p.trim() ? p : undefined
  }, [activeResponse])

  const copyToClipboard = useCallback(async () => {
    if (!activeResponse) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(activeResponse.data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [activeResponse])

  const activePayload = payloadTabs.find((t) => t.id === activePayloadTabId)?.body ?? ""

  const updatePayloadTabBody = useCallback((tabId: string, nextBody: string) => {
    setPayloadTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, body: nextBody } : t)))
  }, [])

  const sendRequest = useCallback(async () => {
    setIsLoading(true)
    setErrorsByTabId((prev) => ({ ...prev, [activePayloadTabId]: null }))
    setResponsesByTabId((prev) => ({ ...prev, [activePayloadTabId]: null }))

    const startTime = performance.now()

    // Log request to console (Developer Feature)
    console.log("[v0] API Request:", {
      method,
      endpoint,
      payload: activePayload ? JSON.parse(activePayload) : undefined,
    })

    try {
      // Validate URL
      const url = new URL(endpoint)

      // Prepare request options
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      // Add body for POST/PUT requests
      if ((method === "POST" || method === "PUT") && activePayload) {
        try {
          JSON.parse(activePayload) // Validate JSON
          options.body = activePayload
        } catch {
          throw { type: "json", message: "Invalid JSON in request payload" }
        }
      }

      // Make the request through our proxy to avoid CORS issues
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const proxyRes = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.toString(),
          method,
          payload: (method === "POST" || method === "PUT") && activePayload ? activePayload : undefined,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const endTime = performance.now()

      // Check if proxy itself failed
      if (!proxyRes.ok) {
        const errorData = await proxyRes.json()
        throw { type: "network", message: errorData.error || "Proxy request failed" }
      }

      // Parse proxy response which contains the actual API response
      const proxyData = await proxyRes.json()

      const apiResponse: ApiResponse = {
        status: proxyData.status,
        statusText: proxyData.statusText,
        data: proxyData.data,
        headers: proxyData.headers,
        time: proxyData.time || Math.round(endTime - startTime),
      }

      setResponsesByTabId((prev) => ({ ...prev, [activePayloadTabId]: apiResponse }))

      // Log response to console (Developer Feature)
      console.log("[v0] API Response:", apiResponse)
    } catch (err: unknown) {
      const endTime = performance.now()

      // Handle different error types
      if (err && typeof err === "object" && "type" in err) {
        setErrorsByTabId((prev) => ({ ...prev, [activePayloadTabId]: err as ApiError }))
      } else if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        // Check if it's likely a CORS issue
        setErrorsByTabId((prev) => ({
          ...prev,
          [activePayloadTabId]: {
            type: "cors",
            message:
              "Unable to reach the server. This might be due to CORS restrictions, network issues, or an invalid URL. Try using a different API endpoint or ensure the server allows cross-origin requests.",
          },
        }))
      } else if (err instanceof DOMException && err.name === "AbortError") {
        setErrorsByTabId((prev) => ({
          ...prev,
          [activePayloadTabId]: {
            type: "timeout",
            message: "Request timed out after 30 seconds. Please try again.",
          },
        }))
      } else {
        setErrorsByTabId((prev) => ({
          ...prev,
          [activePayloadTabId]: {
            type: "unknown",
            message: err instanceof Error ? err.message : "An unexpected error occurred",
          },
        }))
      }

      console.error("[v0] API Error:", err, "Time:", Math.round(endTime - startTime), "ms")
    } finally {
      setIsLoading(false)
    }
  }, [activePayload, endpoint, method])

  const analyzeSelectedPatient = useCallback(async () => {
    setIsLoading(true)
    const t = payloadTabs.find((p) => p.id === activePayloadTabId)
    if (!t) {
      setIsLoading(false)
      return
    }

    setErrorsByTabId((prev) => ({ ...prev, [t.id]: null }))
    setResponsesByTabId((prev) => ({ ...prev, [t.id]: null }))

    const startTime = performance.now()
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: t.label,
          payload: t.body,
        }),
      })

      const endTime = performance.now()
      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "Analyze request failed"
        setErrorsByTabId((prev) => ({ ...prev, [t.id]: { type: "network", message: msg } }))
        setIsLoading(false)
        return
      }

      const analysis: BedrockTextAnalysis = { text: typeof data?.text === "string" ? data.text : "" }
      const apiResponse: ApiResponse = {
        status: 200,
        statusText: "OK",
        data: {
          patient: t.label,
          analysis,
          lambdaOutput: data?.lambdaOutput ?? null,
        },
        headers: { "content-type": "application/json" },
        time: Math.round(endTime - startTime),
      }
      setResponsesByTabId((prev) => ({ ...prev, [t.id]: apiResponse }))
    } catch (err: unknown) {
      setErrorsByTabId((prev) => ({
        ...prev,
        [t.id]: {
          type: "unknown",
          message: err instanceof Error ? err.message : "Unexpected error",
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }, [activePayloadTabId, payloadTabs])

  const methodColors: Record<HttpMethod, string> = {
    GET: "text-success",
    POST: "text-info",
    PUT: "text-warning",
    DELETE: "text-destructive",
  }

  return (
    <div className="w-full p-4 md:p-8">
      {/* Glass Card Container */}
      <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Subtle gradient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="relative p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <Code2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Lumos Protocols Test
              </h1>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4 mb-6">
            {/* Endpoint is hidden; uses DEFAULT_API_ENDPOINT from env via app/page.tsx */}

            {/* Payload Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-foreground">
                  AI Analysis
                </label>
                <div className="flex items-center gap-2">
                  <Select value={activePayloadTabId} onValueChange={setActivePayloadTabId}>
                    <SelectTrigger className="h-8 w-[180px] rounded-lg border-border/50" aria-label="Select patient">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {payloadTabs.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(() => {
                const t = payloadTabs.find((p) => p.id === activePayloadTabId)
                if (!t) return null
                return (
                  <textarea
                    value={t.body}
                    onChange={(e) => updatePayloadTabBody(t.id, e.target.value)}
                    placeholder={'Enter your prompt or payload...\n\nExample:\n{\n  "input": "Hello, API!"\n}'}
                    rows={5}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl resize-y min-h-[120px]",
                      "bg-input border border-border/50",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50",
                      "transition-all duration-200 font-mono text-sm leading-relaxed"
                    )}
                  />
                )
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={analyzeSelectedPatient}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-6 rounded-xl font-semibold text-base",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "relative overflow-hidden group"
                )}
              >
                {/* Ripple effect on hover */}
                <span className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="border-primary-foreground/30 border-t-primary-foreground" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Analyze</span>
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {activeError && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive capitalize">
                    {activeError.type} Error
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeError.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Response Section */}
          {activeResponse && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {/* Response Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="font-semibold text-foreground">Response</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className={cn(
                      "p-2 rounded-lg",
                      "border border-border/50 hover:bg-accent/50",
                      "transition-all duration-200"
                    )}
                    aria-label="Copy response"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Response Body */}
              <div
                className={cn(
                  "rounded-xl border border-border/50 overflow-auto",
                  isProtocolResponse(activeResponse.data) ||
                    narrativeFromAnalysis ||
                    structuredEnvelope
                    ? "bg-transparent p-0 max-h-[min(720px,80vh)]"
                    : "bg-input/50 p-4 max-h-[400px]"
                )}
              >
                {structuredEnvelope ? (
                  <div className="p-2 sm:p-3">
                    <StructuredEligibilityDashboard
                      envelope={structuredEnvelope}
                      patientLabel={analyzePatientLabel}
                    />
                  </div>
                ) : narrativeFromAnalysis ? (
                  <div className="p-1 sm:p-2">
                    <EligibilityNarrativeView patient={narrativeFromAnalysis.patient} rows={narrativeFromAnalysis.rows} />
                  </div>
                ) : typeof activeResponse.data === "object" &&
                  activeResponse.data !== null &&
                  "analysis" in (activeResponse.data as Record<string, unknown>) &&
                  typeof (activeResponse.data as any).analysis?.text === "string" ? (
                  <div className="text-sm text-foreground leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: (props) => <p className="mb-3 last:mb-0" {...props} />,
                        strong: (props) => <strong className="font-semibold" {...props} />,
                        em: (props) => <em className="italic" {...props} />,
                        ul: (props) => <ul className="list-disc pl-5 mb-3 last:mb-0" {...props} />,
                        ol: (props) => <ol className="list-decimal pl-5 mb-3 last:mb-0" {...props} />,
                        li: (props) => <li className="mb-1" {...props} />,
                        code: ({ className, children, ...props }) =>
                          props.node?.position?.start.line === props.node?.position?.end.line ? (
                            <code className={cn("px-1 py-0.5 rounded bg-foreground/10", className)} {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="font-mono text-sm whitespace-pre-wrap p-3 rounded-lg bg-foreground/5 overflow-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ),
                      }}
                    >
                      {(activeResponse.data as any).analysis.text}
                    </ReactMarkdown>
                  </div>
                ) : isProtocolResponse(activeResponse.data) ? (
                  <ProtocolList protocols={activeResponse.data.protocols_evaluated} />
                ) : (
                  <JsonViewer data={activeResponse.data} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Built with React + Tailwind CSS
      </p>
    </div>
  )
}
