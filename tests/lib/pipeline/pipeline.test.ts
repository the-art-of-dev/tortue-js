import { EventPublisherExtender, Pipeline } from '@lib/pipeline';

describe('Testing pipeline', () => {
    it('simple pub/sub', async () => {
        const pipeline = new Pipeline();
        const eventType = 'TRIGGERED';
        const eventData = 'event-data';

        let expected = null;

        const sub = {
            name: 'simple-sub',
            action: (data: any, _: any) => {
                expected = data;
                return Promise.resolve();
            }
        };

        await pipeline.subscribe(eventType, sub);

        const pub = pipeline.register('simple-pub');
        await pub.publish(eventType, eventData);
        expect(expected).toEqual(eventData);
    });

    it('multiple subs', async () => {
        const pipeline = new Pipeline();
        const eventType = 'TRIGGERED';
        const subsCount = 10;

        let expected = 0;

        // subscribe multiple times
        for (let i = 0; i < subsCount; i++) {
            await pipeline.subscribe(eventType, {
                name: `simple-sub${i}`,
                action: (data: any, _: any) => {
                    expected++;
                    return Promise.resolve();
                }
            });
        }

        expect(pipeline.subscribers.get(eventType).length).toBe(10);

        const pub = pipeline.register('simple-pub');
        await pub.publish(eventType);

        expect(expected).toEqual(10);
    });

    it('async pubs', async () => {
        const pipeline = new Pipeline();
        const eventType = 'TRIGGERED';
        const subsCount = 10;

        let expected = 0;

        // subscribe multiple times
        for (let i = 0; i < subsCount; i++) {
            await pipeline.subscribe(eventType, {
                name: `simple-sub${i}`,
                action: (data: any, _: any) => {
                    expected++;
                    return Promise.resolve();
                }
            });
        }

        const pubsResults = [];

        for (let i = 0; i < subsCount; i++) {
            const pub = pipeline.register(`simple-pub${i}`);
            pubsResults.push(pub.publish(eventType));
        }

        await Promise.all(pubsResults);

        expect(expected).toEqual(100);
    });

    it('no subs', async () => {
        const pipeline = new Pipeline();
        const eventType = 'TRIGGERED';
        const eventData = 'event-data';
        const pub = pipeline.register('simple-pub');
        const res = await pub.publish(eventType, eventData);
        expect(res).toEqual([]);
    });

    it('publisher extender', async () => {
        let publishCounter = 0;
        const pubExtender: EventPublisherExtender = {
            extend: (publisher) => {
                return {
                    publish: (event: string, data?: any) => {
                        publishCounter++;
                        return publisher.publish(event, data);
                    }
                };
            }
        };
        const pipeline = new Pipeline([pubExtender]);
        const eventType = 'TRIGGERED';
        const eventData = 'event-data';

        let expected = null;

        const sub = {
            name: 'simple-sub',
            action: (data: any, _: any) => {
                expected = data;
                return Promise.resolve();
            }
        };

        await pipeline.subscribe(eventType, sub);

        const pub = pipeline.register('simple-pub');
        await pub.publish(eventType, eventData);
        expect(expected).toEqual(eventData);
        expect(publishCounter).toEqual(1);
    });

});