import json
import re
from difflib import SequenceMatcher

COURSE_DATA = [
    ("AD", "Artificial Intelligence And Data Science", "Computer & AI"),
    ("AE", "Aeronautical Engineering", "Mechanical & Aerospace"),
    ("AI", "Artificial Intelligence and Machine Learning", "Computer & AI"),
    ("AR", "Architecture", "Architecture"),
    ("AT", "Automotive Engineering", "Mechanical & Aerospace"),
    ("AU", "Automobile Engineering", "Mechanical & Aerospace"),
    ("BC", "BTech Computer Technology", "Computer & AI"),
    ("BD", "Computer Science Engineering-Big Data", "Computer & AI"),
    ("BE", "Bio-Electronics Engineering", "Biotech & Biomedical"),
    ("BI", "Information Technology and Engineering", "Computer & AI"),
    ("BM", "Bio Medical Engineering", "Biotech & Biomedical"),
    ("BR", "BioMedical and Robotic Engineering", "Biotech & Biomedical"),
    ("BS", "Bachelor of Science (Honours)", "Other Engineering"),
    ("BT", "Bio Technology", "Biotech & Biomedical"),
    ("CA", "Computer Science Engineering-AI", "Computer & AI"),
    ("CB", "Computer Science and Business Systems", "Computer & AI"),
    ("CC", "Computer and Communication Engineering", "Computer & AI"),
    ("CD", "Computer Science and Design", "Computer & AI"),
    ("CE", "Civil Engineering", "Civil"),
    ("CF", "Computer Science Engineering-Artificial", "Computer & AI"),
    ("CG", "Computer Science and Technology", "Computer & AI"),
    ("CH", "Chemical Engineering", "Chemical & Allied"),
    ("CI", "Computer Science and Information", "Computer & AI"),
    ("CK", "Civil Engineering (Kannada Medium)", "Civil"),
    ("CM", "ELECTRONICS ENGINEERING(VLSI DESIGN &", "Electronics"),
    ("CO", "Computer Engineering", "Computer & AI"),
    ("CP", "Civil Engineering and Planning", "Civil"),
    ("CR", "Ceramics and Cement Technology", "Chemical & Allied"),
    ("CS", "Computers Science And Engineering", "Computer & AI"),
    ("CT", "Construction Technology and Management", "Civil"),
    ("CV", "Civil Environmental Engineering", "Civil"),
    ("CY", "Computer Science Engineering-Cyber", "Computer & AI"),
    ("DC", "Data Sciences", "Computer & AI"),
    ("DG", "DESIGN", "Other Engineering"),
    ("DM", "COMPUTER SCIENCE AND ENGINEERING", "Computer & AI"),
    ("DS", "Computer Science Engineering-Data", "Computer & AI"),
    ("EA", "Agriculture Engineering", "Chemical & Allied"),
    ("EB", "ELECTRONICS AND COMMUNICATION (ADV", "Electronics"),
    ("EC", "Electronics and Communication Engineering", "Electronics"),
    ("EE", "Electrical And Electronics Engineering", "Electrical"),
    ("EG", "Energy Engineering", "Other Engineering"),
    ("EI", "Electronics and Instrumentation Engineering", "Electronics"),
    ("EL", "Electronics and Instrumentation Tech.", "Electronics"),
    ("EN", "Environmental Engineering", "Other Engineering"),
    ("EP", "BTech Technology and Entrepreneurship", "Other Engineering"),
    ("ER", "Electrical and Computer Engineering", "Electrical"),
    ("ES", "Electronics and Computer Engineering", "Electronics"),
    ("ET", "Electronics and Telecommunication", "Electronics"),
    ("EV", "Electronics Engineering(VLSI Design", "Electronics"),
    ("IB", "Computer Science Engg-IoT including Block", "Computer & AI"),
    ("IC", "CS-Internet of things", "Computer & AI"),
    ("IE", "Information Science and Engineering", "Computer & AI"),
    ("IG", "Information Technology", "Computer & AI"),
    ("II", "Elec. and Communication- Industrial", "Electronics"),
    ("IM", "Industrial Engineering and Management", "Industrial & Robotics"),
    ("IO", "Computer Science Engineering-Internet of", "Computer & AI"),
    ("IP", "Industrial and Production Engineering", "Industrial & Robotics"),
    ("IS", "Information Science and Technology", "Computer & AI"),
    ("IT", "Instrumentation Technology", "Electronics"),
    ("IY", "CS - Information Technology-Cyber Security", "Computer & AI"),
    ("LA", "B Plan", "Other Engineering"),
    ("LC", "Computer Science Engineering-Block Chain", "Computer & AI"),
    ("LJ", "BTECH IN COMPUTER SCIENCE &", "Computer & AI"),
    ("MC", "Mathematics and Computing", "Other Engineering"),
    ("MD", "Medical Electronics", "Electronics"),
    ("ME", "Mechanical Engineering", "Mechanical & Aerospace"),
    ("MK", "Mechanical Engineering (Kannada Medium)", "Mechanical & Aerospace"),
    ("MM", "Mechanical and Smart Manufacturing", "Mechanical & Aerospace"),
    ("MN", "Mining Engineering", "Chemical & Allied"),
    ("MR", "Marine Engineering", "Mechanical & Aerospace"),
    ("MS", "Manufacturing Science and Engineering", "Mechanical & Aerospace"),
    ("MT", "Mechatronics", "Industrial & Robotics"),
    ("NT", "Nano Technology", "Other Engineering"),
    ("OP", "Computer Science Engineering-Dev Ops", "Computer & AI"),
    ("OT", "Industrial IOT", "Computer & AI"),
    ("PE", "Petrochem Engineering", "Chemical & Allied"),
    ("PL", "Petroleum Engineering", "Chemical & Allied"),
    ("PM", "Precision Manufacturing", "Mechanical & Aerospace"),
    ("PT", "Polymer Science and Technology", "Chemical & Allied"),
    ("RA", "Robotics and Automation", "Industrial & Robotics"),
    ("RB", "Robotics", "Industrial & Robotics"),
    ("RI", "Robotics and Artificial Intelligence", "Industrial & Robotics"),
    ("RM", "Computer Science - Robotic Engineering-AI", "Computer & AI"),
    ("RO", "Automation and Robotics Engineering", "Industrial & Robotics"),
    ("SA", "Smart Agritech", "Other Engineering"),
    ("SE", "Aero Space Engineering", "Mechanical & Aerospace"),
    ("SS", "Computer Science and System Engineering", "Computer & AI"),
    ("ST", "Silk Technology", "Chemical & Allied"),
    ("TC", "Telecommunication Engineering", "Electronics"),
    ("TE", "Tool Engineering", "Mechanical & Aerospace"),
    ("TX", "Textile Technology", "Chemical & Allied"),
    ("UP", "Planning", "Other Engineering"),
    ("UR", "Planning", "Other Engineering"),
    ("ZC", "COMPUTER SCIENCE", "Computer & AI"),
    ("AM", "B TECH IN COMP SCI & ENGG (AI & ML)", "Computer & AI"),
    ("BA", "B.TTECH (Agricultural Engineering)", "Chemical & Allied"),
    ("BB", "B TECH IN ELECTRONICS & COMMUNICATION", "Electronics"),
    ("BF", "B TECH (HONS) COMP SCI AND ENGG(DATA", "Computer & AI"),
    ("BG", "B TECH IN ARTIFICIAL INTELLI AND DATA", "Computer & AI"),
    ("BH", "B TECH IN ARTIFICIAL INTELLIGENCE AND ML", "Computer & AI"),
    ("BJ", "B TECH IN ELECTRICAL & ELECTRONICS", "Electrical"),
    ("BK", "B TECH IN ENERGY ENGINEERING", "Other Engineering"),
    ("BL", "B TECH IN AERO SPACE ENGINEERING", "Mechanical & Aerospace"),
    ("BN", "B TECH IN COMPUTER SCIENCE AND TECH(BIG", "Computer & AI"),
    ("BO", "B TECH IN BIO-TECHNOLOGY", "Biotech & Biomedical"),
    ("BP", "B TECH IN CIVIL ENGINEERING", "Civil"),
    ("BQ", "B TECH IN COMPUTER SCIENCE AND", "Computer & AI"),
    ("BU", "B TECH IN COMPUTER SCIENCE AND INFO", "Computer & AI"),
    ("BV", "B TECH IN COMPUTER ENGINEERING", "Computer & AI"),
    ("BW", "B TECH IN COMPUTER SCIENCE AND", "Computer & AI"),
    ("BX", "B TECH IN COMP SCIENCE AND ENGG(CYBER", "Computer & AI"),
    ("BY", "B TECH IN COMP SCIENCE AND", "Computer & AI"),
    ("BZ", "B TECH IN COMPUTER SCIENCE AND", "Computer & AI"),
    ("CL", "B TECH IN ELECTRONICS & COMPUTER", "Electronics"),
    ("CN", "B TECH IN COMP SCI AND ENGG(IOT AND", "Computer & AI"),
    ("CQ", "B TECH IN COMPUTER SCIENCE AND", "Computer & AI"),
    ("CU", "B TECH IN INFORMATION SCIENCE", "Computer & AI"),
    ("CW", "B TECH IN INFORMATION TECHNOLOGY", "Computer & AI"),
    ("CX", "B TECH IN INFORMATION SCIENCE &", "Computer & AI"),
    ("CZ", "B TECH IN COMPUTER SCIENCE AND", "Computer & AI"),
    ("DA", "B TECH IN MATHAMATICS AND COMPUTING", "Other Engineering"),
    ("DB", "B TECH IN MECHANICAL ENGINEERING", "Mechanical & Aerospace"),
    ("DD", "B TECH IN MECHATRONICS ENGINEERING", "Industrial & Robotics"),
    ("DE", "B TECH IN PETROLEUM ENGINEERING", "Chemical & Allied"),
    ("DF", "B TECH IN ROBOTICS AND AUTOMATION", "Industrial & Robotics"),
    ("DH", "B Tech in ROBOTICS AND ARTIFICIAL", "Industrial & Robotics"),
    ("DI", "B TECH IN ROBOTIC ENGINEERING", "Industrial & Robotics"),
    ("DJ", "B TECH IN ROBOTICS", "Industrial & Robotics"),
    ("DK", "B TECH IN COMPUTER SCIENCE AND SYSTEM", "Computer & AI"),
    ("DL", "B TECH IN COMPUTER SCIENCE", "Computer & AI"),
    ("DN", "B.Tech in VLSI", "Electronics"),
    ("LD", "B TECH IN COMPUTER SCIENCE (DATA", "Computer & AI"),
    ("LE", "B TECH IN COMPUTER SCIENCE (AIML)", "Computer & AI"),
    ("LF", "B TECH IN COMPUTER SCIENCE (CLOUD", "Computer & AI"),
    ("LG", "B TECH IN COMPUTER SCIENCE (CYBER", "Computer & AI"),
    ("LH", "B TECH IN COMPUTER SCIENCE (INFORMATION", "Computer & AI"),
    ("LK", "B TECH IN COMPUTER SCIENCE (INTERNET OF", "Computer & AI")
]

def normalize(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

mapped_courses = {}
for code, name, group in COURSE_DATA:
    mapped_courses[normalize(name)] = (code, group)

with open('src/data.json', 'r') as f:
    data = json.load(f)

fallback_map = {
    'B.TECH IN CIVIL CONSTRUCTION AND SUSTAINABILITY ENGINEERING': ('CE', 'Civil'),
    'B.TECH IN COMPUTER ENGINEERING(SOFTWARE PRODUCT DEVELOPMENT)': ('CO', 'Computer & AI'),
    'B.TECH IN COMPUTER SCIENCE AND ARTIFICIAL INTELLIGENCE': ('CA', 'Computer & AI'),
    'B.TECH IN COMPUTER SCIENCE AND ENGG (ROBOTICS)': ('RM', 'Computer & AI'),
    'B.TECH IN COMPUTER SICENCE AND ENGG (DATA ANALYTICS)': ('DS', 'Computer & AI'),
    'B.TECH IN Computer Science and Medical Engineering': ('BM', 'Biotech & Biomedical'),
    'B.TECH IN ELECTRICAL ENGINEERING AND COMPUTER SCIENCE': ('ER', 'Electrical'),
    'B.TECH IN ELECTRONICS ENGINEERING': ('EE', 'Electronics'),
    'B.TECH IN ELECTRONICS ENGINEERING (VLSI AND EMBEDDED SYSTEM)': ('EV', 'Electronics'),
    'B.TECH IN EMBEDDED SYSTEM AND VLSI': ('EV', 'Electronics'),
    'B.TECH IN MECHANICAL AND AEROSPACE ENGINEERING': ('ME', 'Mechanical & Aerospace'),
    'B.Tech In BIOTECHNOLOG Y & BIO- ENGINEERING': ('BT', 'Biotech & Biomedical'),
    'B.Tech in COMPUTER SCIENCE & ENGG (Business Systems)': ('CB', 'Computer & AI'),
    'B.Tech in Computer Science (Internet of Things)': ('IC', 'Computer & AI'),
    'B.Tech in Computer Science and Engineering(Clou d Computing)': ('LF', 'Computer & AI'),
    'B.Tech in Computer Science and Engineering(Dev Ops)': ('OP', 'Computer & AI'),
    'B.Tech in Computer Science and Engineering(Full Stack Development)': ('CS', 'Computer & AI'),
    'B.Tech in Electrical and Electronics Engineering (Electrical Vehicle Technology)': ('EE', 'Electrical'),
    'BACHELOR OF DESIGN (INTERIOR DESIGN )': ('DG', 'Other Engineering'),
    'BIO- TECHNOLOGY': ('BT', 'Biotech & Biomedical'),
    'BIO-MEDICAL ENGINEERING': ('BM', 'Biotech & Biomedical'),
    'BIOMEDICAL AND ROBOTIC ENGINEERING': ('BR', 'Biotech & Biomedical'),
    'BTECH IN COMPUTER SCIENCE AND BUSINESS SYSTEMS': ('CB', 'Computer & AI'),
    'BTECH IN COMPUTER SCIENCE AND DESIGN': ('CD', 'Computer & AI'),
    'BTECH IN ELECTRONICS ENGINEERING(V LSI DESIGN & TECHNOLOGY)': ('EV', 'Electronics'),
    'BTECH IN INFORMATION TECHNOLOGY AUGMENTED REALITY AND VIRUTAL REALITY(AR/VR)': ('IG', 'Computer & AI'),
    'BTECH IN INFORMATION TECHNOLOGY DATA ANALYTICS': ('IG', 'Computer & AI'),
    'BTECH IN MECHANICAL AND SMART MANUFACTURIN G': ('MM', 'Mechanical & Aerospace'),
    'BTECH IN PHARMACEUTIC AL ENGINEERING': ('PH', 'Other Engineering'),
    'CERAMICS & CEMENT ENGINEERING': ('CR', 'Chemical & Allied'),
    'CHEMICAL ENGINEERING': ('CH', 'Chemical & Allied'),
    'CIVIL ENGINEERING': ('CE', 'Civil'),
    'CIVIL ENGINEERING (KANNADA MEDIUM)': ('CK', 'Civil'),
    'CIVIL ENGINEERING WITH COMPUTER APPLICATION': ('CE', 'Civil'),
    'CIVIL ENVIRONMENTA L ENGINEERING': ('CV', 'Civil'),
    'COMMUNICATIO N DESIGN': ('DG', 'Other Engineering'),
    'COMPUTER AND COMMUNICATIO N ENGINEERING': ('CC', 'Computer & AI'),
    'COMPUTER ENGINEERING': ('CO', 'Computer & AI'),
    'COMPUTER SCIENCE': ('CS', 'Computer & AI'),
    'COMPUTER SCIENCE & TECHNOLOGY': ('CG', 'Computer & AI'),
    'COMPUTER SCIENCE AND BUSINESS SYSTEMS': ('CB', 'Computer & AI'),
    'COMPUTER SCIENCE AND DESIGN': ('CD', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGG (ARTIFICIAL INTELLIGENCE)': ('CA', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGG(ARTIFICIA L INTELLIGENCE AND MACHINE LEARNING)': ('AI', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGG(INTERNE T OF THINGS & CYBER SECURITY INCLUDING BLOCK CHAIN TECH)': ('IB', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGG(INTERNE T OF THINGS)': ('IO', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGINEERING': ('CS', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGINEERING (AIML)': ('LE', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)': ('CY', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGINEERING(A RTIFICAL INTELLIGENCE & DATA SCIENCE)': ('AD', 'Computer & AI'),
    'COMPUTER SCIENCE AND ENGINEERING(D ATA SCIENCE)': ('DS', 'Computer & AI'),
    'COMPUTER SCIENCE AND TECHNOLOGY(E XCLUSIVELY FOR DIFFERENTLY ABLED)': ('CG', 'Computer & AI'),
    'CONSTRUCTION TECHNOLOGY AND MGMT': ('CT', 'Civil'),
    'CYBER SECURITY': ('CY', 'Computer & AI'),
    'DATA SCIENCES': ('DC', 'Computer & AI'),
    'DESIGN': ('DG', 'Other Engineering'),
    'ELECTRICAL & COMPUTER ENGINEERING': ('ER', 'Electrical'),
    'ELECTRICAL & ELECTRONICS ENGINEERING': ('EE', 'Electrical'),
    'ELECTRONICS & COMMUNICATIO N ENGINEERING(I NDUSTRIAL INTEGTATED)': ('EC', 'Electronics'),
    'ELECTRONICS & COMPUTER ENGINEERING': ('ES', 'Electronics'),
    'ELECTRONICS & COMPUTER SCIENCE': ('ES', 'Electronics'),
    'ELECTRONICS & INSTRUMENTATI ON ENGINEERING': ('EI', 'Electronics'),
    'ELECTRONICS AND COMMUNICATIO N (ADVANCED COMMUNICATIO N TECHNOLOGY)': ('EB', 'Electronics'),
    'ELECTRONICS AND COMMUNICATIO N ENGG': ('EC', 'Electronics'),
    'ELECTRONICS AND COMMUNICATIO N ENGG (VLSI DESIGN AND TECHNOLOGY)': ('CM', 'Electronics'),
    'ELECTRONICS AND INSTRUMENTATI ON ENGINEERING': ('EI', 'Electronics'),
    'ELECTRONICS AND TELECOMMUNIC ATION ENGINEERING': ('ET', 'Electronics'),
    'ELECTRONICS ENGINEERING(V LSI DESIGN & TECHNOLOGY)': ('EV', 'Electronics'),
    'ENGINEERING DESIGN': ('DG', 'Other Engineering'),
    'ENVIRONMENTA L ENGINEERING': ('EN', 'Other Engineering'),
    'FASHION DESIGN': ('DG', 'Other Engineering'),
    'INDUSTRIAL & PRODUCTION ENGINEERING': ('IP', 'Industrial & Robotics'),
    'INDUSTRIAL DESIGN': ('DG', 'Other Engineering'),
    'INDUSTRIAL ENGINEERING & MANAGEMENT': ('IM', 'Industrial & Robotics'),
    'INDUSTRIAL IOT': ('OT', 'Computer & AI'),
    'INFORMATION SCIENCE': ('IS', 'Computer & AI'),
    'INFORMATION SCIENCE AND ENGINEERING': ('IE', 'Computer & AI'),
    'LIFE STYLE AND ACCESSORY DESIGN': ('DG', 'Other Engineering'),
    'MARINE ENGINEERING': ('MR', 'Mechanical & Aerospace'),
    'MECHANICAL AND SMART MANUFACTURIN G': ('MM', 'Mechanical & Aerospace'),
    'MECHANICAL ENGINEERING': ('ME', 'Mechanical & Aerospace'),
    'MECHANICAL ENGINEERING (KANNADA MEDIUM)': ('MK', 'Mechanical & Aerospace'),
    'MECHATRONICS': ('MT', 'Industrial & Robotics'),
    'MEDICAL ELECTRONICS ENGINEERING': ('MD', 'Electronics'),
    'MINING ENGINEERING': ('MN', 'Chemical & Allied'),
    'PLANNING': ('UP', 'Other Engineering'),
    'POLYMER SCIENCE & TECHNOLOGY': ('PT', 'Chemical & Allied'),
    'PRODUCTION ENGINEERING': ('IP', 'Industrial & Robotics'),
    'ROBOTICS AND ARTIFICIAL INTELLIGENCE': ('RI', 'Industrial & Robotics'),
    'ROBOTICS AND AUTOMATION': ('RA', 'Industrial & Robotics'),
    'SILK TECHNOLOGY': ('ST', 'Chemical & Allied'),
    'TEXTILES TECHNOLOGY': ('TX', 'Chemical & Allied'),
    'B.TECH IN COMPUTER ENGINEERING(S OFTWARE PRODUCT DEVELOPMENT)': ('CO', 'Computer & AI'),
    'B TECH IN COMPUTER SCIENCE AND INFORMATION TECHNOLOGY': ('CI', 'Computer & AI'),
    'B TECH IN COMPUTER SCIENCE AND ENGINEERING(I OT INCLUDING BLOCK CHAIN)': ('IB', 'Computer & AI'),
    'AUTOMATION AND ROBOTICS': ('RO', 'Industrial & Robotics'),
    'B TECH IN COMPUTER SCIENCE & ENGG (ARTIFICIAL INTELLIGENCE AND FUTURE TECHNOLOGIES )': ('CA', 'Computer & AI'),
    'B TECH IN COMPUTER SCIENCE AND ENGINEERING(A RTIFICIAL INTELLIGENCE AND DATA SCIENCE)': ('AD', 'Computer & AI'),
    'B TECH IN COMPUTER SCIENCE AND ENGINEERING(D ATA SCIENCE)': ('DS', 'Computer & AI'),
    'B TECH IN COMPUTER SCIENCE AND ENGINEERING(C YBER SECURITY)': ('CY', 'Computer & AI'),
    'B TECH IN COMPUTER SCIENCE & ENGINEERING (ARTIFICAL INTELLIGENCE & MACHINE LEARNING)': ('AI', 'Computer & AI'),
    'B TECH (HONS) COMPUTER SCIENCE AND ENGINEERING(D ATA SCIENCE)': ('DS', 'Computer & AI'),
    'Artificial Intelligence Engg': ('AI', 'Computer & AI'),
}

for row in data['rows']:
    course = row[2]
    norm_course = normalize(course)
    code = None
    group = None
    
    if norm_course in mapped_courses:
        code, group = mapped_courses[norm_course]
    else:
        best_ratio = 0
        best_match = None
        for name in mapped_courses:
            ratio = SequenceMatcher(None, norm_course, name).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = name
        
        if best_ratio > 0.85:
            code, group = mapped_courses[best_match]
        else:
            if course in fallback_map:
                code, group = fallback_map[course]
    
    if not code:
        code = "??"
    if not group:
        group = "Other Engineering"
        
    # row = [CollegeCode, CollegeName, CourseName, City, BranchGroup, CutoffsList]
    # Update Branch Group
    row[4] = group
    # Append Branch Code as row[6]
    if len(row) == 6:
        row.append(code)
    else:
        row[6] = code

data['branchGroups'] = sorted(list(set([row[4] for row in data['rows']])))

with open('src/data.json', 'w') as f:
    json.dump(data, f, separators=(',', ':'))
