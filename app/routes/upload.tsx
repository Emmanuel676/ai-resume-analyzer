import React, { use, useState } from 'react'
import type { FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader'
import { usePuterStore } from '~/lib/puter'
import { useNavigate } from 'react-router'
import { convertPdfToImage } from '~/lib/pdftoimg'
import { generateUUID } from '~/components/utils'
import { resume } from 'react-dom/server'
import { prepareInstructions, AIResponseFormat } from '../../constants'

const Upload = () => {  
    const{auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);    

    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string; jobTitle: string; jobDescription: string; file: File }) => {
        setIsProcessing(true);
        
        setStatusText('Uploading your file...');
        const uploadedFile= await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: filed to upload file.');

        setStatusText('Converting to Image apply....');
        const imageFile = await convertPdfToImage (file);
        if(!imageFile || !imageFile.file) return setStatusText('Error: failed to convert PDF to image.');

        setStatusText('Uploading image...');
        const uploadedImageFile = await fs.upload([imageFile.file]);
        if(!uploadedImageFile) return setStatusText('Error: failed to upload image file.');

        setStatusText("Preparing data...............")
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImageFile.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing your resume...');
        
        
        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })

        )
        if (!feedback) return setStatusText('Error: failed to get feedback from AI.');

        const feedbackText = typeof feedback.message.content === 'string'
    ? feedback.message.content
    : feedback.message.content[0].text;

// Remove markdown code blocks before parsing
        const cleanedText = feedbackText
            .replace(/```json\n?/g, '')  // Remove ```json
            .replace(/```\n?/g, '')       // Remove closing ```
            .trim();                       // Remove extra whitespace

        console.log('Raw feedback:', feedbackText);
        console.log('Cleaned feedback:', cleanedText);

        data.feedback = JSON.parse(cleanedText);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete! Redirecting...');
            console.log(data); 
            navigate(`/resume/${uuid}`);
    }


    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

       if(!file) return;
       handleAnalyze({companyName,jobTitle,jobDescription,file});
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar/>
            
            <section className="main-section">
                <div className='page-heading py-17'>
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" alt="Analyzing resume" className="w-full"/>
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                            <div className='form-div'>
                                <label htmlFor='company-name'>Company Name</label>
                                <input type="text" name="company-name" placeholder='Company Name' />
                            </div>
                            <div className='form-div'>
                                <label htmlFor='job-title'>Job Title</label>
                                <input type="text" name="job-title" placeholder='Job Title' />
                            </div>
                            <div className='form-div'>
                                <label htmlFor='job-description'>Job Description</label>
                                <textarea rows={5} name="job-description" placeholder='Job Description'></textarea>
                            </div>
                            <div className='form-div'>
                                <label htmlFor='uploader'>Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect}/>
                            </div>
                            <button className='primary-button' type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload
