const {expect} = require('chai')
const {ethers} = require('hardhat')

describe("DemoTest", function () {
    let acc1, acc2, acc3, acc4;
    let payments;

    beforeEach(async function() {
        [acc1, acc2, acc3, acc4] = await ethers.getSigners();
        const Payments = await ethers.getContractFactory("DemoTest", acc1);
        payments = await Payments.deploy();
        await payments.deployed();
        
    })

    it("should be deployed", async function() {
        expect(payments.address).to.be.properAddress;
    })

    it("should be possible to send funds to contract with 1 addr", async function() {
        const arrayAddr = [acc2.address];
        const tx = await payments.connect(acc1).sendETHToContract(arrayAddr, [100], {value:100})
        await expect (() => tx).to.changeEtherBalances([acc1, payments], [-100, 100])

        await tx.wait()

        const newPayment = await payments.getPayment(acc1.address, 0)
        expect(newPayment.amount).to.eq(100)
        expect(newPayment.from).to.eq(acc1.address)
        expect(newPayment.to).to.eq(acc2.address)
    })

    it("should be possible to send funds to contract with 3 addr", async function() {
        const arrayAddr = [acc2.address, acc3.address, acc4.address];
        const tx = await payments.connect(acc1).sendETHToContract(arrayAddr, [100, 200, 300], {value:600})
        await expect (() => tx).to.changeEtherBalances([acc1, payments], [-600, 600])

        await tx.wait()

        const newPayment1 = await payments.getPayment(acc1.address, 0)
        expect(newPayment1.amount).to.eq(100)
        expect(newPayment1.from).to.eq(acc1.address)
        expect(newPayment1.to).to.eq(acc2.address)

        const newPayment2 = await payments.getPayment(acc1.address, 1)
        expect(newPayment2.amount).to.eq(200)
        expect(newPayment2.from).to.eq(acc1.address)
        expect(newPayment2.to).to.eq(acc3.address)

        const newPayment3 = await payments.getPayment(acc1.address, 2)
        expect(newPayment3.amount).to.eq(300)
        expect(newPayment3.from).to.eq(acc1.address)
        expect(newPayment3.to).to.eq(acc4.address)
    })

    it("should be possible to send funds from contract to 1 addr", async function() {
        const newPayment0 = await payments.getPayment(acc1.address, 0)
        const amount = newPayment0.amount;
        const from = newPayment0.from;
        const to = newPayment0.to;
        const time = newPayment0.time;

        const arrayAddr = [acc2.address];
        const moneyValues = [100];
        const tx = await payments.connect(acc1).sendETHToContract(arrayAddr, moneyValues, {value:100})
        await expect (() => tx).to.changeEtherBalances([acc1, payments], [-100, 100])

        await tx.wait()

        const newPayment1 = await payments.getPayment(acc1.address, 0)
        expect(newPayment1.amount).to.eq(100)
        expect(newPayment1.from).to.eq(acc1.address)
        expect(newPayment1.to).to.eq(acc2.address)

        const tx1 = await payments.connect(acc1).sendETHToAddr()
        await expect (() => tx1).to.changeEtherBalances([payments, acc2], [-100, 100])

        await tx1.wait()

        const newPayment2 = await payments.getPayment(acc1.address, 0)
        expect(newPayment2.amount).to.eq(amount)
        expect(newPayment2.from).to.eq(from)
        expect(newPayment2.to).to.eq(to)
        expect(newPayment2.time).to.eq(time)
    })

    it("should be possible to send funds from contract to 3 addr", async function() {
        const newPayment0 = await payments.getPayment(acc1.address, 0)
        const amount = newPayment0.amount;
        const from = newPayment0.from;
        const to = newPayment0.to;

        const arrayAddr = [acc2.address, acc3.address, acc4.address];
        const moneyValues = [100, 200, 300];
        const tx = await payments.connect(acc1).sendETHToContract(arrayAddr, moneyValues, {value:600})
        await expect (() => tx).to.changeEtherBalances([acc1, payments], [-600, 600])

        await tx.wait()

        const checkPayment1 = await payments.getPayment(acc1.address, 0)
        expect(checkPayment1.amount).to.eq(100)
        expect(checkPayment1.from).to.eq(acc1.address)
        expect(checkPayment1.to).to.eq(acc2.address)

        const checkPayment2 = await payments.getPayment(acc1.address, 1)
        expect(checkPayment2.amount).to.eq(200)
        expect(checkPayment2.from).to.eq(acc1.address)
        expect(checkPayment2.to).to.eq(acc3.address)

        const checkPayment3 = await payments.getPayment(acc1.address, 2)
        expect(checkPayment3.amount).to.eq(300)
        expect(checkPayment3.from).to.eq(acc1.address)
        expect(checkPayment3.to).to.eq(acc4.address)

        const tx1 = await payments.connect(acc1).sendETHToAddr()
        await expect (() => tx1).to.changeEtherBalances([payments, acc2, acc3, acc4], [-600, 100, 200, 300])

        await tx1.wait()
        
        for (let i=0; i<3; i++)
        {
            const newPayment2 = await payments.getPayment(acc1.address, i)
            expect(newPayment2.amount).to.eq(amount)
            expect(newPayment2.from).to.eq(from)
            expect(newPayment2.to).to.eq(to)
        }
        
    })

//revert eth
    it("should be reverted with - length diff", async function() {
        const arrayAddr = [acc2.address];
        const moneyValues = [100, 200];
        await expect(
            payments.connect(acc1).sendETHToContract(arrayAddr, moneyValues, {value:100})
        ).to.be.revertedWith("length diff")
    })

    it("should be reverted with - msg.value = 0", async function() {
        const arrayAddr = [acc2.address];
        const moneyValues = [100];
        await expect(
            payments.connect(acc1).sendETHToContract(arrayAddr, moneyValues)
        ).to.be.revertedWith("msg.value = 0")
    })

    it("should be reverted with - not enought or too much", async function() {
        const arrayAddr = [acc2.address];
        const moneyValues = [100];
        await expect(
            payments.connect(acc1).sendETHToContract(arrayAddr, moneyValues, {value:50})
        ).to.be.revertedWith("not enought or too much")
    })

    it("should be reverted with - no payments", async function() {
        await expect(
            payments.connect(acc1).sendETHToAddr()
        ).to.be.revertedWith("no payments")
    })

//erc20
    it("should be token symbol MTK", async function() {
        const Symbol = await payments.getSymbol()
        expect(Symbol).to.eq("MTK")
    })

    it("should be possible to send erc20 to 1 addr", async function() {
        const arrayAddr = [acc2.address];
        const moneyValues = [100];
        const tx = await payments.connect(acc1).sendERC20ToAddr(arrayAddr, moneyValues)
        await expect(() => tx).to.changeTokenBalances(payments, [acc1.address, acc2.address], [-100, 100]);

        await tx.wait()

        const newPayment = await payments.getERC20balance(acc1.address)
        expect(newPayment).to.eq(9900)
    })

    it("should be possible to send erc20 to 3 addr", async function() {
        const arrayAddr = [acc2.address, acc3.address, acc4.address];
        const moneyValues = [100, 200, 300];
        const tx = await payments.connect(acc1).sendERC20ToAddr(arrayAddr, moneyValues)
        await expect(() => tx).to.changeTokenBalances(payments, [acc1.address, acc2.address, acc3.address, acc4.address], [-600, 100, 200, 300]);

        await tx.wait()

        const newPayment = await payments.getERC20balance(acc1.address)
        expect(newPayment).to.eq(9400)
    })

//revert erc20

    it("should be reverted with - length diff", async function() {
        const arrayAddr = [acc2.address];
        const moneyValues = [100, 200];
        await expect(
            payments.connect(acc1).sendERC20ToAddr(arrayAddr, moneyValues)
        ).to.be.revertedWith("length diff")
    })

    it("should be reverted with - not enought tokens", async function() {
        const arrayAddr = [acc2.address];
        const moneyValues = [10001];
        await expect(
            payments.connect(acc1).sendERC20ToAddr(arrayAddr, moneyValues)
        ).to.be.revertedWith("not enought tokens")
    })
})