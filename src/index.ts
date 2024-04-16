import axios from "axios";
// @ts-ignore
import JSEncrypt from "nodejs-jsencrypt";
import {wrapper} from 'axios-cookiejar-support';
import {CookieJar} from 'tough-cookie';

const jar = new CookieJar();

const axiosInstance = wrapper(axios.create({
    baseURL: "https://klas.kw.ac.kr",
    jar: jar,
    withCredentials: true,
    headers: {"Content-Type": "application/json"}
}))

let encrypt = new JSEncrypt()

const login = async () => {

    try {
        const publicKey = await getPublicKey();
        console.log(publicKey);

        encrypt.setPublicKey(publicKey);
        const loginToken = encrypt.encrypt(JSON.stringify({
            "loginId": "",
            "loginPwd": "",
            "storeIdYn": "Y"
        }));

        const response = await axiosInstance.post(
            "/usr/cmn/login/LoginConfirm.do",
            JSON.stringify({
                loginToken: loginToken,
                redirectUrl: "",
                redirectTabUrl: "",
            })
        );
    } catch (e) {
        console.error(e);
    }
};


const getPublicKey = async (): Promise<string> => {

    interface PublicKeyResponse {
        publicKey: string;
    }

    try {
        const response = await axiosInstance.post<PublicKeyResponse>("/usr/cmn/login/LoginSecurity.do",
            {});

        return response.data.publicKey
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export type Root = Root2[]

export interface Root2 {
    value: string
    label: string
    subjList: SubjList[]
}

export interface SubjList {
    value: string
    label: string
    name: string
}

function extractSubjLists(root: Root): SubjList[] {
    return root.reduce((acc: SubjList[], current: Root2) => {
        return acc.concat(current.subjList);
    }, []);
}

const getSubjects = async (): Promise<SubjList[]> => {
    try {
        const response = await axiosInstance.post<Root>("/std/cmn/frame/YearhakgiAtnlcSbjectList.do", {});
        return extractSubjLists(response.data);
        // response.data.
    } catch (e) {
        console.error(e)
        throw e;
    }
}

const getLessons = async (semester: string, subjectId: string) => {
    try {
        const response = await axiosInstance.post<getLessonsResponse>("/std/lis/evltn/LctrumHomeStdInfo.do",
            {
                "selectYearhakgi": semester,
                "selectSubj": subjectId,
                "selectChangeYn": "Y"
            })
        console.log(response.data)
    } catch (e) {
        console.error(e)
        throw e;
    }
}

const getTasks = async (semester: string, subjectId: string) => {
    try {
        const response = await axiosInstance.post("/std/lis/evltn/TaskStdList.do",
            {
                "selectYearhakgi": semester,
                "selectSubj": subjectId,
                "selectChangeYn": "Y"
            })
        console.log(response.data)

    } catch (e) {
        console.error(e)
        throw e;
    }
}

(async () => {
    await login();
    const subjects = await getSubjects();
    console.log(subjects);
    await getLessons("2024,1", "U2024145886120013");
    await getTasks("2024,1", "U2024145886120013");
})();




export interface getLessonsResponse {
    noticeList: NoticeList[]
    dscsnCnt: number
    examCnt: number
    examPrsntCnt: number
    examNewCnt: number
    quizCnt: number
    quizPrsntCnt: number
    quizNewCnt: number
    taskCnt: number
    taskNewCnt: number
    prjctCnt: number
    prjctNewCnt: number
    surveyCnt: number
    dscsnJoinCnt: number
    surveyPrsntCnt: number
    prjctPrsntCnt: number
    taskPrsntCnt: number
    pdsCnt: number
    pdsNewCnt: number
    dscsnNewCnt: number
    surveyNewCnt: number
    isonoff: string
    cntntList: CntntList[]
    cntntCmpltCnt: number
    atendList: AtendList[]
    atendSubList: AtendSubList[]
    rtprgsList: RtprgsList[]
    onRtprgsList: OnRtprgsList[]
    taskTop: any[]
    prjctTop: any[]
    dscsnTop: any[]
    examTop: any[]
    anQuizTop: any[]
}

export interface NoticeList {
    boardNo: number
    masterNo: number
    grcode: string
    year: string
    hakgi: string
    subj: string
    bunban: string
    categoryNm: any
    upperNo: number
    refSort: number
    sortOrdr: number
    refLvl: number
    categoryId: any
    title: string
    content: string
    topAt: string
    othbcAt: any
    atchFileId: any
    readCnt: number
    userNm: string
    registerId: string
    registDt: string
    myarticleAt: string
    dateDiff: number
    fileCnt: number
    cmCnt: number
}

export interface CntntList {
    grcode: string
    subj: string
    year: string
    hakgi: string
    bunban: string
    module: string
    moduletitle: string
    ptype: string
    ptime: string
    lesson: string
    lessontitle: string
    weeklyseq: number
    sDt: string
    eDt: string
    sdate: string
    edate: string
    types: string
    oid: string
    today: string
    prog: number
    edusdate: string
    eduedate: string
    isonoff: string
    weekNo: number
    pagecnt: number
    width: number
    height: number
    starting: string
    registDt?: string
    otype: string
    totalTime?: string
    orderTp: number
    rcognTime: string
}

export interface AtendList {
    weeklyseq: string
    weeklysubseq: string
    attendancediv?: string
    attendancedivLabel?: string
}

export interface AtendSubList {
    weeklyseq: string
    pgr1?: string
    pgr2?: string
    pgr3: any
    pgr4: any
}

export interface RtprgsList {
    weeklyprogress1: string
    weeklyprogress2: string
    weeklyprogress3: string
    weeklyprogress4: string
    weeklyprogress5: string
}

export interface OnRtprgsList {
    module: string
    weekNo: number
    oid: string
    lesson: string
    moduleTitle: string
    lessonTitle: string
    weeklyseq: number
    userId: string
    progress: number
}
