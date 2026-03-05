import { useState } from 'react';
import axios from 'axios';
import { Languages, ArrowRight, CircleDashed, Wallet, BookOpen, Landmark, User, ChevronRight, X, UserMinus, Upload, CheckCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Types
type Step = 'login' | 'otp' | 'language' | 'dashboard' | 'payouts' | 'training' | 'bank' | 'profile' | 'resignation' | 'personal_details' | 'aadhaar_upload' | 'college_id_upload' | 'verification_pending';

type TranslationKeys = {
  platform: string;
  enterMobile: string;
  continue: string;
  verifyOtp: string;
  sentTo: string;
  verifyProceed: string;
  selectLanguage: string;
  selectOne: string;
  proceed: string;
  payouts: string;
  daily: string;
  weekly: string;
  totalPayout: string;
  bankDetails: string;
  edit: string;
  accountNumber: string;
  ifscCode: string;
  bank: string;
  profile: string;
  accessRole: string;
  resign: string;
  signOut: string;
  thinkingToLeave: string;
  sadToSeeGo: string;
  selectReason: string;
  selectLWD: string;
  remarks: string;
  submitResignation: string;
  hi: string;
  earnedThisWeek: string;
  training: string;
  fileSizeNote: string;
  fileTooLarge: string;
};

const translations: Record<string, TranslationKeys> = {
  English: {
    platform: "Campus Canteen",
    enterMobile: "Enter mobile Number",
    continue: "Continue",
    verifyOtp: "Verify OTP",
    sentTo: "Sent to",
    verifyProceed: "Verify & Proceed",
    selectLanguage: "Select language",
    selectOne: "Select one from below",
    proceed: "Proceed",
    payouts: "Payouts",
    daily: "Daily",
    weekly: "Weekly",
    totalPayout: "Total payout",
    bankDetails: "Bank Details",
    edit: "Edit",
    accountNumber: "Bank Account number",
    ifscCode: "IFSC Code",
    bank: "Bank",
    profile: "Profile",
    accessRole: "Access Role",
    resign: "Submit Resignation",
    signOut: "Log Out",
    thinkingToLeave: "Thinking to leave?",
    sadToSeeGo: "We'll be sad to see you go. Please let us know the reason.",
    selectReason: "Select reason for resignation*",
    selectLWD: "Select last Working day (LWD)*",
    remarks: "Add Remarks",
    submitResignation: "Submit resignation",
    hi: "Hi",
    earnedThisWeek: "Earned This Week",
    training: "Training",
    fileSizeNote: "Max image size: 500 KB",
    fileTooLarge: "Image is too large. Please upload an image under 500 KB."
  },
  Hindi: {
    platform: "Campus Canteen",
    enterMobile: "मोबाइल नंबर दर्ज करें",
    continue: "जारी रखें",
    verifyOtp: "ओटीपी सत्यापित करें",
    sentTo: "को भेजा गया",
    verifyProceed: "सत्यापित करें और आगे बढ़ें",
    selectLanguage: "भाषा चुनें",
    selectOne: "नीचे से एक चुनें",
    proceed: "आगे बढ़ें",
    payouts: "भुगतान",
    daily: "दैनिक",
    weekly: "साप्ताहिक",
    totalPayout: "कुल भुगतान",
    bankDetails: "बैंक विवरण",
    edit: "संपादित करें",
    accountNumber: "बँक खाते क्रमांक",
    ifscCode: "IFSC कोड",
    bank: "बँक",
    profile: "प्रोफ़ाइल",
    accessRole: "एक्सेस भूमिका",
    resign: "इस्तीफा जमा करें",
    signOut: "लॉग आउट",
    thinkingToLeave: "छोड़ने की सोच रहे हैं?",
    sadToSeeGo: "हमें आपको जाते देख दुख होगा। कृपया हमें कारण बताएं।",
    selectReason: "इस्तीफा देने का कारण चुनें*",
    selectLWD: "अंतिम कार्य दिवस चुनें (LWD)*",
    remarks: "टिप्पणी जोड़ें",
    submitResignation: "इस्तीफा जमा करें",
    hi: "नमस्ते",
    earnedThisWeek: "इस सप्ताह की कमाई",
    training: "प्रशिक्षण",
    fileSizeNote: "अधिकतम इमेज साइज: 500 KB",
    fileTooLarge: "इमेज बहुत बड़ी है। कृपया 500 KB से कम की इमेज अपलोड करें।"
  },
  Telugu: {
    platform: "Campus Canteen",
    enterMobile: "మొబైల్ నంబర్‌ను నమోదు చేయండి",
    continue: "కొనసాగించండి",
    verifyOtp: "OTPని ధృవీకరించండి",
    sentTo: "కు పంపబడింది",
    verifyProceed: "ధృవీకరించి ముందుకు సాగండి",
    selectLanguage: "భాషను ఎంచుకోండి",
    selectOne: "క్రింద ఉన్న వాటి నుండి ఒకదాన్ని ఎంచుకోండి",
    proceed: "ముందుకు సాగండి",
    payouts: "చెల్లింపులు",
    daily: "రోజువారీ",
    weekly: "వారానికోసారి",
    totalPayout: "మొత్తం చెల్లింపు",
    bankDetails: "బ్యాంక్ వివరాలు",
    edit: "సవరించు",
    accountNumber: "బ్యాంక్ ఖాతా సంఖ్య",
    ifscCode: "IFSC కోడ్",
    bank: "బ్యాంక్",
    profile: "ప్రొఫైల్",
    accessRole: "యాక్సెస్ పాత్ర",
    resign: "రాజీనామాను సమర్పించండి",
    signOut: "లాగ్ అవుట్",
    thinkingToLeave: "వెళ్లాలని ఆలోచిస్తున్నారా?",
    sadToSeeGo: "మీరు వెళ్తున్నందుకు మేము విచారిస్తున్నాము. దయచేసి కారణాన్ని తెలియజేయండి.",
    selectReason: "రాజీనామాకు కారణాన్ని ఎంచుకోండి*",
    selectLWD: "చివరి పని దినాన్ని ఎంచుకోండి (LWD)*",
    remarks: "వ్యాఖ్యలను జోడించండి",
    submitResignation: "రాజీనామాను సమర్పించండి",
    hi: "హలో",
    earnedThisWeek: "ఈ వారం సంపాదన",
    training: "శిక్షణ",
    fileSizeNote: "గరిష్ట పరిమాణం: 500 KB",
    fileTooLarge: "చిత్రం చాలా పెద్దది. దయచేసి 500 KB లోపు చిత్రాన్ని అప్‌లోడ్ చేయండి."
  },
  Kannada: {
    platform: "Campus Canteen",
    enterMobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    continue: "ಮುಂದುವರಿಸಿ",
    verifyOtp: "OTP ಪರಿಶೀಲಿಸಿ",
    sentTo: "ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ",
    verifyProceed: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ",
    selectLanguage: "ಭಾಷೆಯನ್ನು ಆರಿಸಿ",
    selectOne: "ಕೆಳಗಿನವುಗಳಿಂದ ಒಂದನ್ನು ಆರಿಸಿ",
    proceed: "ಮುಂದುವರಿಯಿರಿ",
    payouts: "ಪಾವತಿಗಳು",
    daily: "ದೈನಂದಿನ",
    weekly: "ವಾರಕ್ಕೊಮ್ಮೆ",
    totalPayout: "ಒಟ್ಟು ಪಾವತಿ",
    bankDetails: "ಬ್ಯಾಂಕ್ ವಿವರಗಳು",
    edit: "ತಿದ್ದಿ",
    accountNumber: "ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ",
    ifscCode: "IFSC ಕೋಡ್",
    bank: "ಬ್ಯಾಂಕ್",
    profile: "ಪ್ರೊಫೈಲ್",
    accessRole: "ಪ್ರವೇಶ ಪಾತ್ರ",
    resign: "ರಾಜೀನಾಮೆ ಸಲ್ಲಿಸಿ",
    signOut: "ಲಾಗ್ ಔಟ್",
    thinkingToLeave: "ಹೋಗಲು ಯೋಚಿಸುತ್ತಿದ್ದೀರಾ?",
    sadToSeeGo: "ನೀವು ಹೋಗುತ್ತಿರುವುದಕ್ಕೆ ನಮಗೆ ವಿಷಾದವಿದೆ. ದಯವಿಟ್ಟು ಕಾರಣ ತಿಳಿಸಿ.",
    selectReason: "ರಾಜೀನಾಮೆ ಕಾರಣವನ್ನು ಆರಿಸಿ*",
    selectLWD: "ಕೊನೆಯ ಕೆಲಸದ ದಿನವನ್ನು ಆರಿಸಿ (LWD)*",
    remarks: "ಷರತ್ತುಗಳನ್ನು ಸೇರಿಸಿ",
    submitResignation: "ರಾಜೀನಾಮೆ ಸಲ್ಲಿಸಿ",
    hi: "ನಮಸ್ಕಾರ",
    earnedThisWeek: "ಈ ವಾರದ ಗಳಿಕೆ",
    training: "ತರಬೇತಿ",
    fileSizeNote: "ಗರಿಷ್ಠ ಗಾತ್ರ: 500 KB",
    fileTooLarge: "ಚಿತ್ರವು ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. ದಯವಿಟ್ಟು 500 KB ಗಿಂತ ಕಡಿಮೆ ಇಮೇಜ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."
  },
  Tamil: {
    platform: "Campus Canteen",
    enterMobile: "மொபைல் எண்ணை உள்ளிடவும்",
    continue: "தொடரவும்",
    verifyOtp: "OTP ஐ சரிபார்க்கவும்",
    sentTo: "க்கு அனுப்பப்பட்டது",
    verifyProceed: "சரிபார்த்து தொடரவும்",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    selectOne: "கீழே உள்ளவற்றிலிருந்து ஒன்றைத் தேர்ந்தெடுக்கவும்",
    proceed: "தொடரவும்",
    payouts: "கொடுப்பனவுகள்",
    daily: "தினசரி",
    weekly: "வாராந்திர",
    totalPayout: "மொத்த கொடுப்பனவு",
    bankDetails: "வங்கி விவரங்கள்",
    edit: "திருத்து",
    accountNumber: "வங்கி கணக்கு எண்",
    ifscCode: "IFSC குறியீடு",
    bank: "வங்கி",
    profile: "சுயவிவரம்",
    accessRole: "அணுகல் பங்கு",
    resign: "ராஜினாமாவை சமர்ப்பிக்கவும்",
    signOut: "வெளியேறு (Log Out)",
    thinkingToLeave: "விலக நினைக்கிறீர்களா?",
    sadToSeeGo: "நீங்கள் விலகுவதற்கு நாங்கள் வருந்துகிறோம். தயவுசெய்து காரணத்தைத் தெரிவிக்கவும்.",
    selectReason: "ராஜினாமாவிற்கான காரணத்தைத் தேர்ந்தெடுக்கவும்*",
    selectLWD: "கடைசி வேலை நாளைத் தேர்ந்தெடுக்கவும் (LWD)*",
    remarks: "கருத்துகளைச் சேர்க்கவும்",
    submitResignation: "ராஜினாமாவை சமர்ப்பிக்கவும்",
    hi: "வணக்கம்",
    earnedThisWeek: "இந்த வார வருமானம்",
    training: "பயிற்சி",
    fileSizeNote: "அதிகபட்ச அளவு: 500 KB",
    fileTooLarge: "படம் மிகவும் பெரியது. 500 KB-க்குக் குறைவான படத்தைப் பதிவேற்றவும்."
  },
  Marathi: {
    platform: "Campus Canteen",
    enterMobile: "मोबाईल नंबर प्रविष्ट करा",
    continue: "सुरू ठेवा",
    verifyOtp: "OTP सत्यापित करा",
    sentTo: "वर पाठवले",
    verifyProceed: "सत्यापित करा आणि पुढे जा",
    selectLanguage: "भाषा निवडा",
    selectOne: "खालीलपैकी एक निवडा",
    proceed: "पुढे जा",
    payouts: "पेआउट्स",
    daily: "दैनिक",
    weekly: "साप्ताहिक",
    totalPayout: "एकूण पेआउट",
    bankDetails: "बँक तपशील",
    edit: "संपादित करा",
    accountNumber: "बँक खाते क्रमांक",
    ifscCode: "IFSC कोड",
    bank: "बँक",
    profile: "प्रोफाइल",
    accessRole: "प्रवेश भूमिका",
    resign: "राजीनामा सादर करा",
    signOut: "लॉग आउट",
    thinkingToLeave: "सोडण्याचा विचार करत आहात?",
    sadToSeeGo: "तुम्ही जात आहात याचे आम्हाला दुःख आहे. कृपया आम्हाला कारण सांगा.",
    selectReason: "राजीनाम्याचे कारण निवडा*",
    selectLWD: "शेवटचा कामाचा दिवस निवडा (LWD)*",
    remarks: "शेरा जोडा",
    submitResignation: "राजीनामा सादर करा",
    hi: "नमस्ते",
    earnedThisWeek: "या आठवड्याची कमाई",
    training: "प्रशिक्षण",
    fileSizeNote: "जास्तीत जास्त साईज: 500 KB",
    fileTooLarge: "इमेज खूप मोठी आहे. कृपया 500 KB पेक्षा कमी इमेज अपलोड करा।"
  },
  Bengali: {
    platform: "Campus Canteen",
    enterMobile: "মোবাইল নম্বর লিখুন",
    continue: "চালিয়ে যান",
    verifyOtp: "OTP যাচাই করুন",
    sentTo: "কে পাঠানো হয়েছে",
    verifyProceed: "যাচাই করুন এবং এগিয়ে যান",
    selectLanguage: "ভাষা নির্বাচন করুন",
    selectOne: "নিচের থেকে একটি নির্বাচন করুন",
    proceed: "এগিয়ে যান",
    payouts: "পেআউট",
    daily: "দৈনিক",
    weekly: "সাপ্তাহিক",
    totalPayout: "মোট পেআউট",
    bankDetails: "ব্যাংক বিবরণ",
    edit: "সম্পাদনা করুন",
    accountNumber: "ব্যাংক অ্যাকাউন্ট নম্বর",
    ifscCode: "IFSC কোড",
    bank: "ব্যাংক",
    profile: "প্রোফাইল",
    accessRole: "অ্যাক্সেস ভূমিকা",
    resign: "পদত্যাগপত্র জমা দিন",
    signOut: "লগ আউট",
    thinkingToLeave: "চলে যাওয়ার কথা ভাবছেন?",
    sadToSeeGo: "আপনার চলে যাওয়ায় আমরা দুঃখিত। অনুগ্রহ করে কারণ জানান।",
    selectReason: "পদত্যাগের কারণ নির্বাচন করুন*",
    selectLWD: "শেষ কাজের দিন নির্বাচন করুন (LWD)*",
    remarks: "মন্তব্য যোগ করুন",
    submitResignation: "পদত্যাগপত্র জমা দিন",
    hi: "নমস্কার",
    earnedThisWeek: "এই সপ্তাহের আয়",
    training: "প্রশিক্ষণ",
    fileSizeNote: "সর্বোচ্চ আকার: 500 KB",
    fileTooLarge: "ছবিটি খুব বড়। অনুগ্রহ করে 500 KB-এর কম ছবি আপলোড করুন।"
  },
  Malayalam: {
    platform: "Campus Canteen",
    enterMobile: "മൊബൈൽ നമ്പർ നൽകുക",
    continue: "തുടരുക",
    verifyOtp: "OTP പരിശോധിക്കുക",
    sentTo: "ലേക്ക് അയച്ചു",
    verifyProceed: "പരിശോധിച്ച് മുന്നോട്ട് പോവുക",
    selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    selectOne: "താഴെയുള്ളവയിൽ നിന്ന് ഒന്ന് തിരഞ്ഞെടുക്കുക",
    proceed: "മുന്നോട്ട് പോവുക",
    payouts: "പേഔട്ടുകൾ",
    daily: "ദിനംപ്രതി",
    weekly: "പ്രതിവാരം",
    totalPayout: "ആകെ പേഔട്ട്",
    bankDetails: "ബാങ്ക് വിവരങ്ങൾ",
    edit: "തിരുത്തുക",
    accountNumber: "ബാങ്ക് അക്കൗണ്ട് നമ്പർ",
    ifscCode: "IFSC കോഡ്",
    bank: "ബാങ്ക്",
    profile: "പ്രൊഫൈൽ",
    accessRole: "പ്രവേശന റോൾ",
    resign: "രാജിക്കത്ത് സമർപ്പിക്കുക",
    signOut: "ലോഗ് ഔട്ട്",
    thinkingToLeave: "പോകാൻ ആലോചിക്കുന്നുണ്ടോ?",
    sadToSeeGo: "നിങ്ങൾ പോകുന്നത് കാണുന്നതിൽ ഞങ്ങൾക്ക് സങ്കടമുണ്ട്. ദയവായി കാരണം അറിയിക്കുക.",
    selectReason: "രാജിക്കുള്ള കാരണം തിരഞ്ഞെടുക്കുക*",
    selectLWD: "അവസാന പ്രവൃത്തി ദിവസം തിരഞ്ഞെടുക്കുക (LWD)*",
    remarks: "അഭിപ്രായങ്ങൾ ചേർക്കുക",
    submitResignation: "രാജിക്കത്ത് സമർപ്പിക്കുക",
    hi: "ഹലോ",
    earnedThisWeek: "ഈ ആഴ്ചയിലെ വരുമാനം",
    training: "പരിശീലനം",
    fileSizeNote: "പരമാവധി സൈസ്: 500 KB",
    fileTooLarge: "ചിത്രം വളരെ വലുതാണ്. ദയവായി 500 KB-യിൽ താഴെയുള്ള ചിത്രം അപ്‌ലോഡ് ചെയ്യുക."
  }
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [payoutTab, setPayoutTab] = useState<'daily' | 'weekly'>('daily');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState('10 Jan');
  const [selectedWeek, setSelectedWeek] = useState('05 Jan - 11 Jan');

  // Onboarding States
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [ageError, setAgeError] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState<string | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<string | null>(null);
  const [collegeName, setCollegeName] = useState('');
  const [collegeIdPhoto, setCollegeIdPhoto] = useState<string | null>(null);
  const [volunteer, setVolunteer] = useState<any>(null);

  const t = translations[language] || translations['English'];

  const handleLogin = async () => {
    if (phoneNumber.length === 10) {
      setIsLoading(true);
      try {
        const response = await axios.post(`${API_URL}/api/otp/send`, { phone: phoneNumber });
        if (response.data.success) {
          setCurrentStep('otp');
        } else {
          alert('Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Server connection failed. Make sure your backend is running.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 4) {
      setIsLoading(true);
      try {
        const response = await axios.post(`${API_URL}/api/otp/verify`, {
          phone: phoneNumber,
          otp: otp
        });
        if (response.data.success) {
          const volt = response.data.volunteer;
          if (volt) {
            setVolunteer(volt);
            if (volt.status === 'Approved') {
              setCurrentStep('dashboard');
            } else if (volt.status === 'Pending') {
              setCurrentStep('verification_pending');
            } else if (volt.status === 'Rejected') {
              setCurrentStep('otp'); // Or a rejected screen
              alert('Your application was rejected. Please contact support.');
            }
          } else {
            setCurrentStep('personal_details');
          }
        } else {
          alert('Invalid OTP. Please check your backend terminal.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        alert('OTP verification failed or expired.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      // 500 KB = 500 * 1024 bytes
      if (file.size > 500 * 1024) {
        alert(t.fileTooLarge);
        e.target.value = ''; // Reset input
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setter(base64);
      } catch (error) {
        console.error('File conversion error:', error);
      }
    }
  };

  const handlePersonalDetailsSubmit = () => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setAgeError('Please ensure your Date of Birth reflects an age of 18 or above.');
    } else {
      setAgeError('');
      setCurrentStep('aadhaar_upload');
    }
  };

  const handleSubmitOnboarding = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/volunteers/onboard`, {
        phone: phoneNumber,
        name: fullName,
        dob: dob,
        collegeName,
        aadhaarNumber,
        aadhaarFront,
        aadhaarBack,
        collegeIdCard: collegeIdPhoto
      });
      if (response.data.success) {
        setVolunteer(response.data.volunteer);
        setCurrentStep('verification_pending');
      }
    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      if (error.response?.status === 413) {
        alert('Images are too large. Please try with smaller photos.');
      } else {
        alert('Failed to submit onboarding. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl h-screen bg-white shadow-xl flex flex-col relative overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {currentStep === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="relative h-[60vh] overflow-hidden">
              <img
                src="/hero-onboarding.png"
                alt="Onboarding"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => setCurrentStep('language')}
                  className="bg-white/90 p-2 rounded-full shadow-lg border border-orange-100 active:scale-95 transition-transform"
                >
                  <Languages className="w-6 h-6 text-primary" />
                </button>
              </div>
            </div>

            <div className="px-6 py-8 flex-1 flex flex-col gap-6 -mt-10 bg-white rounded-t-[40px] relative z-10">
              <div>
                <h1 className="text-3xl font-bold text-secondary mb-6">{t.platform}</h1>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-3 border-gray-200">
                    <img src="https://flagcdn.com/w40/in.png" alt="India Flag" className="w-6 h-4 object-cover" />
                    <span className="font-bold text-gray-700">+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder={t.enterMobile}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-24 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none text-lg font-bold transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={phoneNumber.length !== 10 || isLoading}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl transition-all ${phoneNumber.length === 10 ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' : 'bg-gray-100 text-gray-300'
                  }`}
              >
                {isLoading ? (
                  <CircleDashed className="animate-spin" />
                ) : (
                  <>
                    {t.continue}
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 p-8 flex flex-col justify-center gap-10"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">{t.verifyOtp}</h2>
              <p className="text-gray-500">{t.sentTo} +91 {phoneNumber}</p>
            </div>

            <div className="flex justify-between gap-4">
              {[...Array(4)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-100 rounded-2xl focus:border-primary outline-none"
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const newOtp = otp.split('');
                    newOtp[i] = e.target.value;
                    setOtp(newOtp.join(''));
                    if (e.target.value && i < 3) {
                      (e.target.nextElementSibling as HTMLInputElement)?.focus();
                    }
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 4 || isLoading}
              className={`w-full py-4 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3 ${otp.length === 4 ? 'opacity-100' : 'opacity-50'
                }`}
            >
              {isLoading ? <CircleDashed className="animate-spin" /> : t.verifyProceed}
            </button>
          </motion.div>
        )}

        {currentStep === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 p-3 flex flex-col min-h-0 relative"
          >
            <button
              onClick={() => setCurrentStep(phoneNumber ? 'dashboard' : 'login')}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mb-6 flex-shrink-0">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Languages className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-1">{t.selectLanguage}</h2>
              <p className="text-gray-500 text-sm">{t.selectOne}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 mb-8 overflow-y-auto pr-2 min-h-0">
              {[
                { name: 'English', sub: 'English' },
                { name: 'हिन्दी', sub: 'Hindi' },
                { name: 'తెలుగు', sub: 'Telugu' },
                { name: 'ಕನ್ನಡ', sub: 'Kannada' },
                { name: 'தமிழ்', sub: 'Tamil' },
                { name: 'मराठी', sub: 'Marathi' },
                { name: 'বাংলা', sub: 'Bengali' },
                { name: 'മലയാളം', sub: 'Malayalam' }
              ].map((lang) => (
                <button
                  key={lang.sub}
                  onClick={() => setLanguage(lang.sub)}
                  className={`p-4 rounded-xl border-2 flex items-center justify-between text-left transition-all ${language === lang.sub
                    ? 'border-primary bg-orange-50 text-secondary'
                    : 'border-gray-100 text-gray-600'
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">{lang.name}</span>
                    {lang.name !== lang.sub && <span className="text-xs opacity-60">{lang.sub}</span>}
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${language === lang.sub ? 'border-primary' : 'border-gray-300'
                    }`}>
                    {language === lang.sub && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 pb-2 flex-shrink-0">
              <button
                onClick={() => setCurrentStep(phoneNumber ? 'dashboard' : 'login')}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                {t.proceed}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'payouts' && (
          <motion.div
            key="payouts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-[#F0F2F9] h-full min-h-0"
          >
            {/* Header */}
            <div className="bg-white px-4 py-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentStep('dashboard')}
                  className="p-2 rounded-xl text-gray-500 active:scale-95"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-secondary">Payouts</h2>
                  <p className="text-[10px] font-medium text-gray-400">Ver: 4.86.3 | ODZ005954 | 3</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white flex border-t border-gray-100 flex-shrink-0">
              {(['daily', 'weekly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPayoutTab(tab)}
                  className={`flex-1 py-4 text-sm font-bold transition-all relative ${payoutTab === tab ? 'text-secondary' : 'text-gray-400'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {payoutTab === tab && (
                    <motion.div
                      layoutId="payoutTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-secondary"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Date Strip */}
            <div className="relative z-30">
              <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="bg-[#DCE7FF]/50 px-4 py-2.5 flex items-center gap-2 flex-shrink-0 cursor-pointer active:bg-[#DCE7FF]/70 transition-colors"
              >
                <span className="text-sm font-bold text-secondary">
                  {payoutTab === 'daily' ? selectedDay : selectedWeek}
                </span>
                <ChevronRight className={`w - 4 h - 4 text - secondary transition - transform ${showDatePicker ? '-rotate-90' : 'rotate-90'} `} />
              </div>

              <AnimatePresence>
                {showDatePicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDatePicker(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 bg-white shadow-xl border-b border-gray-100 p-2 z-50 rounded-b-2xl"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {payoutTab === 'daily' ? (
                          ['10 Jan', '09 Jan', '08 Jan', '07 Jan', '06 Jan', '05 Jan'].map((day) => (
                            <button
                              key={day}
                              onClick={() => {
                                setSelectedDay(day);
                                setShowDatePicker(false);
                              }}
                              className={`p - 3 rounded - xl text - sm font - bold transition - all ${selectedDay === day ? 'bg-secondary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                } `}
                            >
                              {day}
                            </button>
                          ))
                        ) : (
                          ['05 Jan - 11 Jan', '29 Dec - 04 Jan', '22 Dec - 28 Dec'].map((week) => (
                            <button
                              key={week}
                              onClick={() => {
                                setSelectedWeek(week);
                                setShowDatePicker(false);
                              }}
                              className={`p-3 rounded-xl text-sm font-bold transition-all col-span-2 ${selectedWeek === week ? 'bg-secondary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                              {week}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 min-h-0">
              {/* Main Summary Card */}
              <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b border-gray-50">
                  <span className="font-bold text-secondary">Total payout</span>
                  <span className="text-xl font-bold text-gray-300">₹0</span>
                </div>

                {/* Empty State */}
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-secondary text-sm">No Payouts Yet</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Complete your first delivery to<br />start earning payouts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'bank' && (
          <motion.div
            key="bank"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 p-6 flex flex-col bg-white"
          >
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setCurrentStep('dashboard')}
                className="bg-gray-100 p-2 rounded-xl text-gray-500 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h2 className="text-xl font-bold">{t.bankDetails}</h2>
                <p className="text-xs font-mono text-gray-400">CB00019</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700">{t.bankDetails}</h3>
                <button className="flex items-center gap-1.5 text-blue-500 font-bold bg-blue-50 px-3 py-1.5 rounded-lg text-sm active:scale-95">
                  <User className="w-3.5 h-3.5" />
                  {t.edit}
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                {[
                  { label: t.accountNumber, value: '2578100025956' },
                  { label: t.ifscCode, value: 'BARBOSSILUD' },
                  { label: t.bank, value: 'Auto fetch' }
                ].map((field, i) => (
                  <div key={i} className={`p - 4 ${i !== 2 ? 'border-b border-gray-100' : ''} `}>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">{field.label}</span>
                    <span className="font-mono text-gray-700 font-bold">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 p-6 flex flex-col bg-white"
          >
            <div className="flex items-center gap-4 mb-10">
              <button
                onClick={() => setCurrentStep('dashboard')}
                className="bg-gray-100 p-2 rounded-xl text-gray-500 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h2 className="text-xl font-bold">{t.profile}</h2>
                <p className="text-xs font-mono text-gray-400">CB00019</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-50 p-3 border border-gray-200 rounded-xl">
                <span className="text-gray-400 text-sm block mb-1">{t.accessRole}</span>
                <span className="font-bold text-secondary">e.g Picker</span>
              </div>

              <button
                onClick={() => setCurrentStep('resignation')}
                className="w-full flex items-center justify-between p-5 border-2 border-gray-100 rounded-2xl hover:border-red-100 group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                    <UserMinus className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-700">{t.resign}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-300 transition-colors" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'resignation' && (
          <motion.div
            key="resignation"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col bg-white"
          >
            <div className="p-6 pb-2">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setCurrentStep('profile')}
                  className="bg-gray-100 p-2 rounded-xl text-gray-500 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div>
                  <h2 className="text-xl font-bold">Employee Resignation</h2>
                  <p className="text-xs font-mono text-gray-400">CB00019</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20">
              <div className="bg-orange-50 rounded-3xl p-8 mb-8 flex flex-col items-center gap-4 text-center border border-orange-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-orange-100">
                  <UserMinus className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-lg">{t.thinkingToLeave}</h4>
                  <p className="text-xs text-orange-700 opacity-70">{t.sadToSeeGo}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase italic mb-2 block">{t.selectReason}</label>
                  <select className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary outline-none bg-gray-50 font-bold text-gray-700 appearance-none">
                    <option>Select reason</option>
                    <option>Exams starting</option>
                    <option>Personal reasons</option>
                    <option>Finished internship hours</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase italic mb-2 block">{t.selectLWD}</label>
                  <div className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary outline-none bg-gray-50 flex justify-between items-center text-gray-700">
                    <span className="font-bold">{t.selectLWD}</span>
                    <div className="w-4 h-4 border border-gray-300 rounded" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase italic mb-2 block">{t.remarks}</label>
                  <textarea
                    className="w-full p-4 h-32 rounded-xl border-2 border-gray-100 focus:border-primary outline-none bg-gray-50 font-medium"
                    placeholder="Tell us more..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 bg-white border-t border-gray-100">
              <button
                onClick={() => setCurrentStep('dashboard')}
                className="w-full py-4 rounded-2xl bg-secondary text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
              >
                {t.submitResignation}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col bg-[#F0F2F9]"
          >
            {/* Header - White Section */}
            <div className="bg-white px-4 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-secondary font-semibold text-lg">
                    {t.hi}, {volunteer?.name || "Neeraj Kumar"}
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    {volunteer?.volunteerId || "CB00019"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 relative">
                    <button onClick={() => setCurrentStep('language')} className="bg-orange-50/50 p-2 rounded-xl text-primary active:scale-95 transition-all">
                      <Languages className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowProfileMenu(true)}
                      className="p-2 px-3 rounded-xl active:scale-95 transition-all flex flex-col gap-0.5 bg-gray-100/50 text-gray-400"
                    >
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                    </button>

                    <AnimatePresence>
                      {showProfileMenu && (
                        <div className="absolute top-0 right-0 z-50">
                          {/* Close backdrop */}
                          <div
                            className="fixed inset-0"
                            onClick={() => setShowProfileMenu(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="relative w-52 bg-white rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 py-2 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                setCurrentStep('profile');
                                setShowProfileMenu(false);
                              }}
                              className="w-full px-5 py-3 text-left text-secondary hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => {
                                setCurrentStep('login');
                                setPhoneNumber('');
                                setOtp('');
                                setShowProfileMenu(false);
                              }}
                              className="w-full px-5 py-3 text-left text-secondary hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                              Logout
                            </button>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Content - Tinted Section */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCurrentStep('payouts')}
                  className="bg-white p-6 rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col items-center gap-3 text-center active:scale-95 group"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50/50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-secondary text-sm">{t.payouts}</span>
                </button>
                <button
                  onClick={() => setCurrentStep('training')}
                  className="bg-white p-6 rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col items-center gap-3 text-center active:scale-95 group"
                >
                  <div className="w-16 h-16 rounded-full bg-purple-50/50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-secondary text-sm">{t.training}</span>
                </button>
                <button
                  onClick={() => setCurrentStep('bank')}
                  className="bg-white p-6 rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col items-center gap-3 text-center active:scale-95 group"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50/50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                    <Landmark className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-secondary text-sm">{t.bankDetails}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'personal_details' && (
          <motion.div
            key="personal_details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-white"
          >
            <div className="p-6 pb-2">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setCurrentStep('otp')}
                  className="bg-gray-100 p-2 rounded-xl text-gray-500 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-xl font-bold text-secondary text-left">Personal Details</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
              <div className="space-y-4">
                <label className="block font-bold text-secondary text-sm ml-1">Full Name (As per Aadhaar)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none font-bold text-lg transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block font-bold text-secondary text-sm ml-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setAgeError('');
                  }}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none font-bold text-lg transition-all"
                />
              </div>

              {ageError ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mt-4">
                  <p className="text-xs font-bold text-red-600 leading-relaxed">
                    {ageError}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mt-4">
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Note: Age 18 or above is mandatory for joining.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <button
                onClick={handlePersonalDetailsSubmit}
                disabled={!fullName || !dob}
                className={`w-full py-4 rounded-2xl font-bold transition-all text-center ${fullName && dob
                  ? 'bg-primary text-white shadow-lg shadow-orange-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  } `}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'aadhaar_upload' && (
          <motion.div
            key="aadhaar_upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-white"
          >
            <div className="p-6 pb-2">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setCurrentStep('personal_details')}
                  className="bg-gray-100 p-2 rounded-xl text-gray-500 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-xl font-bold text-secondary text-left">Submit Aadhaar</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
              <div className="space-y-4">
                <label className="block font-bold text-secondary text-sm ml-1">Aadhaar Number</label>
                <input
                  type="tel"
                  maxLength={12}
                  placeholder="0000 0000 0000"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none font-bold text-lg transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="block font-bold text-secondary text-sm ml-1">Aadhaar Card Photos (Front & Back)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-orange-50 hover:border-primary transition-all overflow-hidden group">
                    {aadhaarFront ? (
                      <img src={aadhaarFront} className="w-full h-full object-cover" alt="Front" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary">Front Side</span>
                      </>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setAadhaarFront)} />
                  </div>
                  <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-orange-50 hover:border-primary transition-all overflow-hidden group">
                    {aadhaarBack ? (
                      <img src={aadhaarBack} className="w-full h-full object-cover" alt="Back" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary">Back Side</span>
                      </>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setAadhaarBack)} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic text-center">{t.fileSizeNote}</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl hidden">
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Note: Age 18 or above is mandatory for joining.
                </p>
              </div>
            </div>

            <div className="p-6 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <button
                onClick={() => setCurrentStep('college_id_upload')}
                disabled={!aadhaarNumber || aadhaarNumber.length < 12 || !aadhaarFront || !aadhaarBack}
                className={`w-full py-4 rounded-2xl font-bold transition-all text-center ${aadhaarNumber.length === 12 && aadhaarFront && aadhaarBack
                  ? 'bg-primary text-white shadow-lg shadow-orange-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'college_id_upload' && (
          <motion.div
            key="college_id_upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-white"
          >
            <div className="p-6 pb-2">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setCurrentStep('aadhaar_upload')}
                  className="bg-gray-100 p-2 rounded-xl text-gray-500 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-xl font-bold text-secondary text-left">Submit College ID Card</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
              <div className="space-y-4">
                <label className="block font-bold text-secondary text-sm ml-1">College Name</label>
                <div className="relative">
                  <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Enter your college name"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none font-bold text-lg transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block font-bold text-secondary text-sm ml-1">College ID Card Photo</label>
                <div className="relative aspect-video rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-orange-50 hover:border-primary transition-all overflow-hidden group">
                  {collegeIdPhoto ? (
                    <img src={collegeIdPhoto} className="w-full h-full object-cover" alt="College ID" />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-gray-700">Tap to Upload</span>
                        <span className="text-xs text-gray-400">Front side of your ID card</span>
                      </div>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setCollegeIdPhoto)} />
                </div>
                <p className="text-[10px] text-gray-400 italic text-center">{t.fileSizeNote}</p>
              </div>
            </div>

            <div className="p-6 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <button
                onClick={handleSubmitOnboarding}
                disabled={!collegeName || !collegeIdPhoto || isLoading}
                className={`w-full py-4 rounded-2xl font-bold transition-all text-center flex items-center justify-center gap-2 ${collegeName && collegeIdPhoto && !isLoading
                  ? 'bg-primary text-white shadow-lg shadow-orange-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isLoading ? <CircleDashed className="animate-spin" /> : 'Continue'}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'verification_pending' && (
          <motion.div
            key="verification_pending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col bg-white p-8 items-center justify-center text-center gap-8"
          >
            <div className="relative">
              <div className="w-32 h-32 bg-secondary/5 rounded-full flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Search className="w-16 h-16 text-secondary" />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white shadow-lg"
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-secondary">Verification Pending</h2>
              <p className="text-gray-500 leading-relaxed px-4">
                Thank you for submitting your details. Our team is currently reviewing your documents.
              </p>
              <div className="inline-block bg-orange-50 px-4 py-2 rounded-full border border-orange-100 mt-2">
                <span className="text-sm font-bold text-primary">Expected time: 24 Hours</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('login')}
              className="mt-8 px-8 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-500 active:scale-95 transition-all"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
