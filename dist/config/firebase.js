"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)({
        clientEmail: "firebase-adminsdk-fbsvc@what-s-new-f5a22.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZ0EWBYvA0g6q7\nlD81XqfsU9MUx3tYIUkOgaUcBru0BrD+3Wixgd49e9oB80gp4r8smlYWZTzjN4+w\nNKMjUW6nT/6nU7NGvdf+mZ7r7wv8V11jyZ1Xod/XCTEVqAO281WBW8T7Sxu4SYfQ\nRrt0f3sY/yGxVhdUAmty3h4vneoKhXNjjovmGp4nFWLqfKqoFzZfv2AfsdBEjSKL\nr1yo3Lehgsa+gsXr2dxLREs21fTqBw2c95QAZIqNzx+2b8oep3i39QHjjVp//V4L\nrcb9r7NDY+K9AgTVIk9FnXA5adIe4ZkAgakfPoyH7YiDkcLr+8eN65fX/bFqHmdQ\n+RXRDK2DAgMBAAECggEAFfXNJCvk+u5xdsMOEmPuO0ICTJyGH48PjhJdIrO9Ffv8\nuV16Ujc9QGatxreQBYUScD1JQ63GU0RFTOcpsYRiyySiEJ28O/wk/ErhvnjV9QWb\n6VUo825jIouPMtdDNJ1Y+BdYB1v9uflT45hWCvtVXmJOs9HxvSsXSTgCxBtAPvog\nzRlMR3C7b/yCVFIylldzFtDwP2pK2AK5bpj87+DusxamdutnZUFvsEWrN1o7Csjh\nzggEVj+QgcHSBN1h1NSg3+javugxBdv3enL2mf6xK+8hKC+lpDWXzZ3ro2b5p4J5\nY4OfVoP4nmJ7qN5RSF9uw07An0FiuXf6c9zM8odCoQKBgQD2WCW5zTzdeuYngrSh\n+hLSCpAgA+YcDjdV3WCALB/tZfRihdLMylDkAKUr8WezbxlkPvzgZdzVdFmYD+kM\n9z55l4ovOHoJdni5WINPXCl6LgR/qSkb5f9vTKTs+th9NGFG13jbq7XOzlCZ9IUE\nUVQVs2+KWH7jta1pDFpqNuzzYwKBgQDiWdew4mlLGI2Zjz2u460L7ajxQEp2u785\nSWwSow9ogB6JMyH77wn4PqLIrYmX+amVzgiOv3nnm+Wf4KpRSGbvah5bHS20LkRf\npGggTc6NIiV7FiQKePVZspV5N3QsvT5TIRxfuS8BUbyfZDgms5QQ0x9mR32kWfd0\n8lZhtGxHYQKBgQDyhI8HXxUnmeFRTm0T9YRnwbxnuE7mmdxCLQHezRHVfgTcpZCE\nyjxeaoAxRaRo0tw1g4kiRUXl4nh9qlQtzo5z2AtTN491F2v8VDZZf4rZ3MnTAC8X\nZxNUeCj5oG5WvKVzv5cc8+u1oAlbt4zoVkSoZJFPqpWpCWehvmaYoGAfrwKBgAUG\nd5puvGW1atdg7b6nQV1Fbn3ErqKKMomkDqkvQ5VPWt4y62s7eF4xjc2kxKxCF7jC\ntT/uElfJB0UQaNebIuXn1jqxoCUi7dOtw74L3C0X9/sOl8g/vTq7k0P4rjScEvkn\ngAjEBL4jwWtMf06kqAHjngvYRHrUoIDRLIfIyKqhAoGAEY037IdNUGsWDKMP3bAF\nr9ysmqwvlhyaSnbiqTSA5373zZSzn3j04MmCLcdgp1gY9Q+4+Bxh3/JXEwZ2lpPP\nLNMpzenbszMPX+F5JVx+Cz4wXQW10c+VP6iZVMOmEF8mR8tmzunKboaCmByUmYOq\notFem0uQEk2XsXyCGDD4cTE=\n-----END PRIVATE KEY-----\n",
        projectId: "what-s-new-f5a22",
    }),
    storageBucket: "what-s-new-f5a22.firebasestorage.app",
});
exports.storage = (0, storage_1.getStorage)().bucket();
