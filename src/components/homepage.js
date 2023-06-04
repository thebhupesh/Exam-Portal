export default function Homepage({ connect }) {
    return (<>
        <section className="jumbotron text-center pt-5">
            <div className="container">
                <h1 className="jumbotron-heading">Welcome to the Exam Portal</h1>
                <p className="lead">Get certified with our unique NFT-based exams</p>
                <p>
                    <button className="btn btn-outline-dark my-2" onClick={_ => connect()}>Get Started</button>
                </p>
            </div>
        </section>
        <section className="py-5">
            <div className="container">
                <h2 className="text-center">About</h2>
                <hr />
                <div className="row">
                    <div className="col-md-4">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Secure and Immutable</h4>
                                <p className="card-text">NFT-based exams are secured using blockchain technology, which makes them nearly impossible to tamper with or manipulate.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Multiple Choice Questions</h4>
                                <p className="card-text">The exams consist of multiple-choice questions, which are designed to test students' knowledge on specific topics.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Time-Limit</h4>
                                <p className="card-text">The exams have a time limit, which puts pressure on students to complete the exam within a specific period.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Remote Access</h4>
                                <p className="card-text">The exams are accessible remotely, allowing students to take the exam from any location with an internet connection.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Instant Grading</h4>
                                <p className="card-text">The exams can be graded instantly, providing students with immediate feedback on their performance.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Cost-Effective</h4>
                                <p className="card-text">NFT-based exams can be more cost-effective than traditional exams, as they do not require physical materials or a testing center.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="py-5">
            <div className="container">
                <h2 className="text-center">Future Plans</h2>
                <hr />
                <div className="row">
                    <div className="col-md-6">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">NFT Certification</h4>
                                <p className="card-text">Students who pass the exam receive a unique NFT-based certificate, which can be used as proof of their achievement.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Randomized Questions</h4>
                                <p className="card-text">The exams may randomize the order of questions, making it difficult for students to share answers.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Study Materials</h4>
                                <p className="card-text">The portal may provide students with study materials, such as videos, articles, and practice questions, to prepare for the exam.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Gamification</h4>
                                <p className="card-text">The portal may gamify the learning experience by providing rewards, badges, and leaderboards for top performers.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>);
}