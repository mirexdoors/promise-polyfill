const statuses = {
    pending: 'PENDING',
    fullfilled: 'FULLFILLED',
    rejected: 'REJECTED',
}

class MyPromise {
    #state;
    #thenFn = () => {
    };
    #catchFn = () => {
    };

    constructor(fn) {
        this.#state = statuses.pending;
        return fn(this.#resolve.bind(this), this.#reject.bind(this));
    }

    #resolve(data) {
        if (this.#state === statuses.pending) {
            this.#state = statuses.fullfilled;
            setTimeout(() => {
                try {
                    this.#thenFn(data);
                } catch (e) {
                    this.#catchFn(e);
                    this.#state = statuses.rejected;
                }
            }, 0)
        }
    }

    #reject(error) {
        if (this.#state === statuses.pending) {
            this.#state = statuses.rejected;
            setTimeout(() => {
                return this.#catchFn(error);
            }, 0);
        }
    }

    then(onResolved, onRejected) {
        if (onResolved) {
            this.#thenFn = onResolved;
        }

        if (onRejected) {
            this.#catchFn = onRejected;
        }

        return this;
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }
}

const promiseTimeout = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('Time is over');
    }, 1000);
});

promiseTimeout.then((data) => console.log(data)).catch(err => console.error(err))
