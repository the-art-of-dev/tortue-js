export type PipelineEventType = string;

export interface EventPublisher {
    publish: (eventType: PipelineEventType, data?: any) => Promise<any>;
}

export interface EventPublisherExtender {
    extend: (publisher: EventPublisher) => EventPublisher;
}

export type PipelineAction<D, R> = (data: D, publisher: EventPublisher) => Promise<R>;

export interface PipelineSubscriber<D, R> {
    name: string;
    action: PipelineAction<D, R>;
}

export interface PipelineEventLogRecord {
    eventType: PipelineEventType;
    data: any;
    publisherName: string;
    subscribers: string[];
}

export class Pipeline {
    private _eventLog: PipelineEventLogRecord[];
    private _subscribers: Map<PipelineEventType, PipelineSubscriber<any, any>[]>; // EventName -> SubscribedCallbacks Array
    private _publisherExtenders: EventPublisherExtender[];


    /**
     *
     */
    constructor(publisherExtenders?: EventPublisherExtender[]) {
        this._eventLog = [];
        this._subscribers = new Map();
        this._publisherExtenders = publisherExtenders ?? [];
    }

    private async _publish<D, R>(eventType: PipelineEventType, data: D, publisherName: string): Promise<R[]> {
        if (!this._subscribers.has(eventType)) return [];
        const subscribers = this._subscribers.get(eventType);

        this._eventLog.push({
            eventType,
            data,
            publisherName,
            subscribers: subscribers.map(s => s.name)
        });

        const results = [];

        for (const sub of subscribers) {
            const res = await sub.action(data, this._generatePublisher(sub.name));
            results.push(res);
        }

        return results;
    };

    private _extendPublisher(publisher: EventPublisher): EventPublisher {
        for (const ext of this._publisherExtenders) {
            publisher = ext.extend(publisher);
        }
        return publisher;
    }

    private _generatePublisher(publisherName: string): EventPublisher {
        return this._extendPublisher({
            publish: (event: string, data: any) => {
                const name = publisherName;
                return this._publish(event, data, name);
            }
        });
    };

    public register(publisherName: string) {
        return this._generatePublisher(publisherName);
    }

    public async subscribe<D, R>(eventType: PipelineEventType, subscriber: PipelineSubscriber<D, R>) {
        if (!this._subscribers.has(eventType)) this._subscribers.set(eventType, []);
        this._subscribers.get(eventType).push(subscriber);
    }

    public get subscribers() {
        return this._subscribers;
    }

    public get events(): PipelineEventType[] {
        return Array.from(this._subscribers.keys());
    }

    public get eventLog(): PipelineEventLogRecord[] {
        return [...this._eventLog];
    }
}
