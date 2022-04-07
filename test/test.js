const { assert } = require('chai')
const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('images', async () => {
    let result, imageCount
    const hash = 'abc123'
    before(async () => {
      result = await decentragram.uploadImage(hash, 'Image description', { from: author });
      imageCount = await decentragram.imageCount()
    })
    it('creates images', async () => {
      //SUCCESS
      assert.equal(imageCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is not correct')
      assert.equal(event.hash, hash, 'hash is not correct')
      assert.equal(event.description, 'Image description', 'description is not correct')
      assert.equal(event.tipAmount, 0, 'tip amount is not correct')
      assert.equal(event.author, author, 'author is not correct')

      //FAILURE
      await decentragram.uploadImage('', 'Image description', { from: author }).should.be.rejected
      await decentragram.uploadImage('abc123', '', { from: author }).should.be.rejected
      await decentragram.uploadImage('abc123', 'Image description', { from: 0x0 }).should.be.rejected
    })

    //check from Struct
    it('lists images', async () => {
      const image = await decentragram.images(imageCount);
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is not correct')
      assert.equal(image.hash, hash, 'hash is not correct')
      assert.equal(image.description, 'Image description', 'description is not correct')
      assert.equal(image.tipAmount, 0, 'tip amount is not correct')
      assert.equal(image.author, author, 'author is not correct')
    })

    //tip image author
    it('tip image author', async () => {
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)
      result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'ether') })
      //SUCCESS
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is not correct')
      assert.equal(event.hash, hash, 'hash is not correct')
      assert.equal(event.description, 'Image description', 'description is not correct')
      assert.equal(event.tipAmount, web3.utils.toWei('1', 'ether'), 'tip amount is not correct')
      assert.equal(event.author, author, 'author is not correct')

      //Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tip
      tip = web3.utils.toWei('1', 'ether')
      tip = new web3.utils.BN(tip)

      const expectedBalance = oldAuthorBalance.add(tip)
      assert.equal(newAuthorBalance.toString(),expectedBalance.toString())
      //FAILURE
      await decentragram.tipImageOwner(99,{ from: tipper, value: web3.utils.toWei('1', 'ether') }).should.be.rejected
    })
  })
})