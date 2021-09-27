const states = {
    pending: 'PENDING',
    fulfilled: 'fulfilled',
    rejected: 'REJECTED',
}

class MyPromise {
    #state;
    #deferred = [];
    #value;

    constructor(fn) {
        if (typeof fn !== 'function') {
            throw new TypeError("not a function");
        }
        this.#state = states.pending;

        try {
            fn(this.#resolve.bind(this), this.#reject.bind(this));
        } catch (e) {
            this.#reject.bind(this)(e);
        }
    }

    #resolve(data) {
        if (this.#state === states.pending) {
            this.#state = states.fulfilled;
            this.#value = data;
            this.#handle();
        }
    }

    #reject(error) {
        if (this.#state === states.pending) {
            this.#state = states.rejected;
            this.#value = error;
            this.#handle();
        }
    }

    #handle() {
        if (this.#state === states.rejected && this.#deferred.length === 0) {
            console.log("Unhandled promise rejection", this.#value)
        }

        this.#deferred.forEach((deferred) => {
            setTimeout(() => {
                const callback = this.#state === states.fulfilled ? deferred.onResolved : deferred.onRejected;
                if (callback === null) {
                    if (this.#state === states.fulfilled) {
                        this.#resolve.bind(deferred.promise)(this.#value);
                    } else {
                        this.#reject.bind(deferred.promise)(this.#value);
                    }
                    return;
                }

                let result;

                try {
                    result = callback(this.#value);
                } catch (e) {
                    this.#reject.bind(deferred.promise)(e);
                }
                this.#resolve.bind(deferred.promise)(result);
            }, 0);
        });
    }

    then(onResolved, onRejected) {
        const promise = new this.constructor(() => {});
        this.#deferred.push({
            onResolved: typeof onResolved === 'function' ? onResolved : null,
            onRejected: typeof onRejected === 'function' ? onRejected : null,
            promise
        });
        return promise;
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }
}

const promiseTimeout = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('Time is over');
        reject(new Error('Error'))
    }, 1000);
});

promiseTimeout
    .then((data) => {
        console.log(data)
        throw new Error("Error!")
    })
    .then(() => {
        console.log("step2")
    })
    .catch(err => console.error(err))
