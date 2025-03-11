interface IMsg {
    content: string,
}

interface ICandidateMetaInfo {
    name: string
    id: string
}

type ISubEvent = () => {
    msgList: IMsg[]
    candidateMetaInfo: ICandidateMetaInfo,
}

class CandidateMsgManager {
    eventId = 0
    events = new Map<number, ISubEvent>()
    subscribeCandidateMsg(cb: ISubEvent): number {
        const id = ++this.eventId
        this.events.set(id, cb)
        return id
    }
    unsubscribeCandidateMsg(eventId: number): void {

    }
    notify() {
        // 调用所有的events
        this.events.forEach((cb) => {
            cb()
        })
    }

}
